const express = require('express');
const { pool } = require("../db");
const { s3Client } = require("../s3");
const router = express.Router();
const { clerkMiddleware, getAuth } =  require('@clerk/express')
const bodyParser = require("body-parser");
const { GetObjectCommand, PutObjectCommand, S3ServiceException, NoSuchKey } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require('dotenv');
const multer = require('multer');
const { v4 } = require('uuid');
const cors = require('cors');
const upload = multer({storage: multer.memoryStorage()});
dotenv.config();

router.use(cors());
router.use(clerkMiddleware());
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json())

router.get("/", (req, res) => {
    const { isAuthenticated, userID } = getAuth(req);
    
    if (isAuthenticated) {
        try {
            pool.query(`SELECT * FROM images WHERE userID=?`, [userID], async (err, results, fields) => {
                if (results !== undefined) {
                    const imagesJSON = Object.values(JSON.parse(JSON.stringify(results)));
                    const preSignedURLs = [];   
                    
                    if (imagesJSON.length > 0) {
                        for (const json of imagesJSON) {
                            const command = GetObjectCommand({
                                Bucket: 'www.taginspo.com',
                                Key: json.title,
                            });

                            const preSignedURL = await getSignedUrl(s3Client, command, {expiresIn: 3600});
                            preSignedURLs.push(preSignedURL);
                        }
                        
                        return res.send(preSignedURLs);     
                    }
                }
                
                return res.send("User hasn't add any images");
            });
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
    const { isAuthenticated, userID } = getAuth(req);
    const imageID = v4();
    const title = req.body.title;

    if (isAuthenticated) {
        try {
            const [rows] = pool.query(`SELECT * FROM images WHERE userID=? AND title=?`, [userID, title]);
            
            if (rows.length === 0) {
                const command = new PutObjectCommand({
                    Bucket: 'www.taginspo.com',
                    Key: req.file.originalname,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype
                });
                
                const response = await s3Client.send(command);
                pool.query('INSERT INTO images VALUES (?, ?, ?)', [userID, imageID, title]);
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
        return res.status(401).send('User not authenticated');
    }
});

module.exports = router;