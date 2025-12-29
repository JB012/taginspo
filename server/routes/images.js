const express = require('express');
const { pool } = require("../db");
const { createDateTime } = require("../utils");
const { s3Client, cloudFront, createSignedURL } = require("../s3-cloudfront");
const router = express.Router();
const { clerkMiddleware, getAuth, clerkClient } =  require('@clerk/express')
const bodyParser = require("body-parser");
const { DeleteObjectCommand, PutObjectCommand, S3ServiceException, NoSuchKey } = require('@aws-sdk/client-s3');
const { CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const dotenv = require('dotenv');
const multer = require('multer');
const { v4 } = require('uuid');
const cors = require('cors');
const axios = require('axios');
const { url } = require('inspector');
const upload = multer({storage: multer.memoryStorage()});
dotenv.config();

router.use(cors());
router.use(clerkMiddleware());
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json())

router.get("/", async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);
    
    if (isAuthenticated) {
        try {
            const [rows, fields] = await pool.query(`SELECT * FROM images WHERE user_id=? ORDER BY created_at ASC`, [userId]);

            const imagesJSON = Object.values(JSON.parse(JSON.stringify(rows)));
            const imageURLs = [];

            if (imagesJSON.length > 0) {
                for (const json of imagesJSON) {
                    //const signedURL = createSignedURL(json.title);
                    const [rows, fields] = await pool.query(`SELECT tag_id FROM users_images_tags WHERE user_id=? AND image_id=?`, [userId, json.image_id]);

                    const tagIDs = Object.values(JSON.parse(JSON.stringify(rows)));
                        
                    imageURLs.push({...json, url: undefined, tagIDs: tagIDs});
                    
                }

                return res.send(imageURLs);     
            }
        }
        catch(err) {
            if (err instanceof NoSuchKey) {
                console.error(`Error from S3 while getting object "${key}" from "${bucketName}". No such key exists.`);
            } 
            else if (err instanceof S3ServiceException) {
                console.error( `Error from S3 while getting object from ${bucketName}.  ${err.name}: ${err.message}`);
            } 
            else {
                console.log(err);
            }
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.get("/:id", async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);
    
    if (isAuthenticated) {
        const imageID = req.params.id;

        const [[image], fields] = await pool.query(`SELECT * FROM images WHERE user_id=? AND image_id=?`, [userId, imageID]);

        
        //const signedURL = createSignedURL(image.title);

        return res.send({url: url, ...image});
    }
    else {
        return res.status(401).send('User not authenticated');
    }
    
})

router.post("/add", upload.single('file'), async (req, res) => {
    const { isAuthenticated, userId, getToken } = getAuth(req);
    const imageID = v4();
    const title = req.body.title;
    const source = req.body.source;
    const addedTags = req.body.addedTags;

    if (isAuthenticated) {
        try {

            const [rows, fields] = await pool.query(`SELECT * FROM images WHERE user_id=? AND title=?`, [userId, title]);
            
            if (rows.length === 0) {
                /* const command = new PutObjectCommand({
                    Bucket: 'www.taginspo.com',
                    Key: title,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype
                });
                        
                await s3Client.send(command);
 */
                const url = URL.createObjectURL(new Blob(req.file.buffer))

                await pool.query('INSERT INTO images (user_id, image_id, created_at, title, source) VALUES (?, ?, ?, ?, ?)', [userId, imageID, createDateTime(), title, source]);
                
                const token = await getToken();

                await axios.post('http://localhost:3000/tags/add', {multipleTags: addedTags, imageID: imageID}, 
                    {headers: {Authorization: `Bearer ${token}`}}
                );

                return res.send('Image successfully added');
            }
            else {
                return res.send("Title already exists, please try again.");
            }
        }
        catch(err) {
            if (err instanceof S3ServiceException && err.name === "EntityTooLarge") {
                console.error(
                    `Error from S3 while uploading object to ${bucketName}. \
                    The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
                    or the multipart upload API (5TB max).`,
                );
            } 
            else if (err instanceof S3ServiceException) {
                console.error(`Error from S3 while uploading object to ${bucketName}.  ${err.name}: ${err.message}`,);
            } 
            else {
                console.log(err);
            }
        }
    }
    else {
        return res.status(401).send('User not authenticated to add images');
    }
});

router.post("/edit/:id", async (req, res) => {
    const { isAuthenticated, userId, getToken } = getAuth(req);
    const imageID = req.params.id;
    const title = req.body.title;
    const source = req.body.source;
    const addedTags = req.body.addedTags;

    if (isAuthenticated) {
        try {
            // check if any tags are changed or deleted 
            await pool.query(`UPDATE images SET title=? AND source=? WHERE user_id=? AND image_id=?`
                , [title, source, userId, imageID]);

            const token = await getToken();

            await axios.post("http://localhost:3000/tags/edit",{imageID: imageID, addedTags: addedTags}, 
                {headers: {Authorization: `Bearer ${token}`}});
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
})

router.delete("/delete/:id", async (req, res) => {
    const imageID = req.params.id;
    const { isAuthenticated, userId } = getAuth(req);
    
    if (isAuthenticated) {
        try {
            const [rows, fields] = await pool.query(`SELECT * FROM images WHERE user_id=? AND image_id=?`, [userId, imageID]);
            
            if (rows.length) {
                const imageInfo = rows[0];

                /* const s3Command = new DeleteObjectCommand({Bucket: bucketName, Key: imageInfo.title});
                await s3Client.send(s3Command);

                //Invalidating cloudfront cache for the image
                const invalidateParams = { 
                    DistributionId: process.env.DISTRIBUTION_ID,
                    InvalidationBatch: {
                        CallerReference: imageInfo.title,
                        Paths: {
                            Quantity: 1,
                            Items: [
                                "/" + imageInfo.title
                            ]
                        }
                    }
                }

                const invalidationCommand = new CreateInvalidationCommand(invalidateParams);
                await cloudFront.send(invalidationCommand); */

                await pool.query(`DELETE FROM images WHERE user_id=? AND image_id=?`, [userId, imageID]);
            
                return res.send('Image successfully deleted');
            }
            else {
                    return res.send('Image with id doesn\'t exist.');
            }
        }
        catch (err) {
            if (err instanceof S3ServiceException && err.name === "NoSuchBucket") {
                console.error(`Error from S3 while deleting object from ${bucketName}. The bucket doesn't exist.`);
            } 
            else if (err instanceof S3ServiceException) {
                console.error(`Error from S3 while deleting object from ${bucketName}.  ${err.name}: ${err.message}`);
            } 
            else {
                console.log(err);
            }
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

module.exports = router;