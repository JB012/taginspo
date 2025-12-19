const express = require('express');
const { pool } = require("../db");
const { s3Client } = require("../s3-cloudfront");
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
router.use(bodyParser.json());

router.get('/', (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        pool.query(`SELECT tag_id, title, color FROM tags WHERE user_id=?`, [userId], (err, results, fields) => {
            const tagsJSON = Object.values(JSON.parse(JSON.stringify(results)));
    
            return tagsJSON.length !== 0 ? res.send(tagsJSON) 
            : res.send('User has no tags added');
        });
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.post('/add', (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        const multipleTags = req.body.multipleTags;

        if (!multipleTags) {
            const title = req.body.title;
            const color = req.body.color;
            const tagID =  req.body.tagID;
            

            pool.query(`SELECT * FROM tags WHERE user_id=? AND title=?`, [userId, title], (err, results, fields) => {
                const tagJSON = Object.values(JSON.parse(JSON.stringify(results)));
                if (tagJSON.length === 0) {
                    try {
                        pool.query(`INSERT INTO tags (user_id, tag_id, title, color) VALUES (?, ?, ?, ?)`, [userId, tagID, title, color]);

                        return res.send('Tag successfully added');
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                else {
                    return res.send("Title already exists, please try again");
                }
            });     
        }   
        else {
            const imageID = req.body.imageID;
            try {
                for (const tag of multipleTags) {   
                    const title = tag.title;
                    const color = tag.color;
                    const tagID = tag.tag_id;

                    pool.getConnection((err, conn) => {
                        conn.query(`SELECT * FROM tags WHERE tag_id=?`, [tag.tag_id], (err, results, fields) => {
                            const tag = Object.values(JSON.parse(JSON.stringify(results)));

                            if (!tag.length) {
                                conn.query(`INSERT INTO tags (user_id, tag_id, title, color) VALUES (?, ?, ?, ?)`, [userId, tagID, title, color])
                                conn.query(`INSERT INTO users_images_tags (user_id, image_id, tag_id) VALUES (?, ?, ?)`, [userId, imageID, tag.tag_id]);
                            }
                        });

                        conn.release();
                    });
                    
                }

                return res.send('All tags have been added successfully');
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.post('/delete', (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);
    const tagID = req.body.tagID;

    if (isAuthenticated) {
        try {
            pool.query(`DELETE FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

module.exports = router;