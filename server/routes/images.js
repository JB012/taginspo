const express = require('express');
const { pool } = require("../db");
const { s3Client, cloudFront } = require("../s3-cloudfront");
const router = express.Router();
const { clerkMiddleware, getAuth, clerkClient } =  require('@clerk/express')
const bodyParser = require("body-parser");
const { DeleteObjectCommand, PutObjectCommand, S3ServiceException, NoSuchKey } = require('@aws-sdk/client-s3');
const { CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const dotenv = require('dotenv');
const multer = require('multer');
const { v4 } = require('uuid');
const cors = require('cors');
const axios = require('axios');
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
            const [rows, fields] = await pool.query(`SELECT * FROM images WHERE user_id=?`, [userId]);

            const imagesJSON = Object.values(JSON.parse(JSON.stringify(rows)));
            const imageURLs = [];

            if (imagesJSON.length > 0) {
                for (const json of imagesJSON) {
                    const imageURL = `https://d2ijutr0xv20w3.cloudfront.net/${json.title}`;
                    const expiresInOneHour = new Date(Date.now() + 1000 * 60 * 60);
                    const signedURL = getSignedUrl({
                        url: imageURL,
                        dateLessThan: expiresInOneHour,
                        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
                        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID
                    });

                    const [rows, fields] = await pool.query(`SELECT tag_id FROM users_images_tags WHERE user_id=? AND image_id=?`, [userId, json.image_id]);

                    const tagIDs = Object.values(JSON.parse(JSON.stringify(rows)));
                        
                    imageURLs.push({id: json.image_id, title: json.title, url: signedURL, source: json.source, tagIDs: tagIDs});
                    
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

router.post("/add", upload.single('file'), async (req, res) => {
    const { isAuthenticated, userId, sessionId } = getAuth(req);
    const imageID = v4();
    const title = req.body.title;
    const source = req.body.source;
    const addedTags = req.body.addedTags;

    if (isAuthenticated) {
        try {

            const [rows, fields] = await pool.query(`SELECT * FROM images WHERE user_id=? AND title=?`, [userId, title]);

            if (rows.length === 0) {
                const command = new PutObjectCommand({
                    Bucket: 'www.taginspo.com',
                    Key: title,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype
                });
                        
                const response = await s3Client.send(command);

                await pool.query('INSERT INTO images (user_id, image_id, title, source) VALUES (?, ?, ?, ?)', [userId, imageID, title, source]);
            
                const token = await clerkClient.sessions.getToken(sessionId);
                        
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

router.post("/delete:id", async (req, res) => {
    const imageID = req.params.id;
    const { isAuthenticated, userId } = getAuth(req);
    
    if (isAuthenticated) {
        try {
            const [rows, fields] = await pool.query(`SELECT * FROM images WHERE userID=? AND image_id=?`, [userId, imageID]);
            
            if (rows.length) {
                const imageInfo = rows[0];

                const s3Command = new DeleteObjectCommand({Bucket: bucketName, Key: imageInfo.title});
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
                await cloudFront.send(invalidationCommand);

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