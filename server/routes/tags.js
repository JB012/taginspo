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
const { createDateTime } = require('../utils');
const axios = require('axios');

const upload = multer({storage: multer.memoryStorage()});
dotenv.config();

router.use(cors());
router.use(clerkMiddleware());
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.get('/', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        const imageID = req.query.imageID;

        if (!imageID) {    
            const [rows, fields] = await pool.query(`SELECT * FROM tags WHERE user_id=?`, [userId]);

            return res.send(rows);
        }
        else {
            const [rows, fields] = await pool.query(`SELECT tag_id FROM users_images_tags WHERE user_id=? AND image_id=?`, [userId, imageID]);

            const tagIDs = rows.map((tagJSON) => tagJSON.tag_id);

            const allTags = [];

            for (const tagID of tagIDs) {
                const [tag, fields] = await pool.query(`SELECT * FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);
                allTags.push(tag[0]);
            }

            return res.send(allTags);
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.get('/:id', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);
    const tagID = req.params.id;

    if (isAuthenticated) {
        const [rows] = await pool.query(`SELECT * FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);

        if (rows.length > 0) {
            return res.send(rows[0]);
        }

        return res.send(`No tag found`);
    }
    else {
        return res.status(401).send('User not authenticated');
    }
})

router.post('/add', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        const multipleTags = JSON.parse(req.body.multipleTags);
        const imageID = req.body.imageID;

        try {
            for (const tag of multipleTags) {   
                const title = tag.title;
                const color = tag.color;
                const tagID = tag.tag_id;

                const [rows, fields] = await pool.query(`SELECT * FROM tags WHERE tag_id=?`, [tagID]);
                
                if (rows.length === 0) {
                    await pool.query(`INSERT INTO tags (user_id, created_at, tag_id, title, color) VALUES (?, ?, ?, ?, ?)`, [userId, createDateTime(), tagID, title, color]);
                }

                if (imageID) {
                        await pool.query(`INSERT INTO users_images_tags (user_id, image_id, tag_id) VALUES (?, ?, ?)`, [userId, imageID, tagID]);
                }
            }

            return res.send('All tags have been added successfully');
        }
        catch (err) {
            console.log(err);
        }
        
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.post('/edit', async (req, res) => {
    const { isAuthenticated, userId, getToken } = getAuth(req);
    const title = req.body.title;
    const color = req.body.color;
    const imageID = req.body.imageID;
    
    if (isAuthenticated) {
        // Editing tags that were changed while editing an image
        if (imageID) {
            const [allTagsInImage, fields] = await pool.query(`SELECT tag_id FROM users_images_tags WHERE user_id=? AND image_id=?`, [userId, imageID]);
       
            const addedTags = JSON.parse(req.body.addedTags);

            //not in addedTags but in allTagsInImage
            const tagsToRemove = allTagsInImage.filter((elemTag) => !addedTags.some((tag) => tag.tag_id === elemTag.tag_id));
            
            //in addedTags but not in allTagsInImage
            const tagsToAdd = addedTags.filter((tag) => !allTagsInImage.some((existingTag) => existingTag.tag_id === tag.tag_id));

            const tagsAlreadyInImage = addedTags.filter((tag) => allTagsInImage.some((existingTag) => existingTag.tag_id === tag.tag_id));

            for (const tag of tagsToRemove) {
                await pool.query(`DELETE FROM users_images_tags WHERE user_id=? AND image_id=? AND tag_id=?`, [userId, imageID, tag.tag_id]);
            }

             for (const tag of tagsAlreadyInImage) {
                await pool.query(`UPDATE tags SET title=?, color=? WHERE user_id=? AND tag_id=?`, [tag.title, tag.color, userId, tag.tag_id]);
            }

            if (tagsToAdd.length > 0) {
                const token = await getToken();
            
                await axios.post("http://localhost:3000/tags/add", {multipleTags: JSON.stringify(tagsToAdd), imageID: imageID}, 
                    {headers: {Authorization: `Bearer ${token}`}}
                );
            }

            return res.send(`Tag${addedTags.length > 1 ? "s" : ""} successfully edited`);
        }
        // Individually editing a tag
        else {
            const tagID = req.body.tagID;
            await pool.query(`UPDATE tags SET title=?, color=? WHERE user_id=? AND tag_id=?`, [title, color, userId, tagID])
            res.send(`Tag successfully updated`);
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