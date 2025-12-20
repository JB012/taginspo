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

router.get('/', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        const [rows, fields] = await pool.query(`SELECT tag_id, title, color FROM tags WHERE user_id=?`, [userId]);

        return rows.length !== 0 ? res.send(rows) 
        : res.send('User has no tags added');
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.post('/add', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        const multipleTags = req.body.multipleTags;

        if (!multipleTags) {
            const title = req.body.title;
            const color = req.body.color;
            const tagID =  req.body.tagID;
            

            const [rows, fields] = await pool.query(`SELECT * FROM tags WHERE user_id=? AND title=?`, [userId, title]);

            if (rows.length === 0) {
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
        }   
        else {
            const imageID = req.body.imageID;
            try {
                for (const tag of multipleTags) {   
                    const title = tag.title;
                    const color = tag.color;
                    const tagID = tag.tag_id;

                    const [tag, fields] = await pool.query(`SELECT * FROM tags WHERE tag_id=?`, [tag.tag_id]);
                    
                    if (!tag.length) {
                        await pool.query(`INSERT INTO tags (user_id, tag_id, title, color) VALUES (?, ?, ?, ?)`, [userId, tagID, title, color]);
                        await pool.query(`INSERT INTO users_images_tags (user_id, image_id, tag_id) VALUES (?, ?, ?)`, [userId, imageID, tag.tag_id]);
                    }
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

router.post('/delete', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);
    const tagID = req.body.tagID;

    if (isAuthenticated) {
        try {
            await pool.query(`DELETE FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);
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