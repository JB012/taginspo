const express = require('express');
const { supabase } = require("../sb");
const router = express.Router();
const { clerkMiddleware, getAuth } =  require('@clerk/express')
const bodyParser = require("body-parser");
const cors = require('cors');
const { createDateTime } = require('../utils');
const axios = require('axios');

require('dotenv').config();

router.use(cors());
router.use(clerkMiddleware());
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.get('/', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (isAuthenticated) {
        const imageID = req.query.imageID;

        try {
            if (!imageID) {    
                const { data } = await supabase.from('tags').select().eq('user_id', userId);
                return res.send(data);
            }
            else {
                const { data } = await supabase.from('users_images_tags').select('tag_id').eq('user_id',  userId).eq('image_id', imageID);

                //const [rows, fields] = await pool.query(`SELECT tag_id FROM users_images_tags WHERE user_id=? AND image_id=?`, [userId, imageID]);

                const tagIDs = data.map((tagJSON) => tagJSON.tag_id);

                const allTags = [];

                for (const tagID of tagIDs) {
                    const { data } = await supabase.from('tags').select().eq('user_id', userId).eq('tag_id', tagID);
                    //const [tag, fields] = await pool.query(`SELECT * FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);
                    allTags.push(data[0]);
                }

                return res.send(allTags);
            }
        }
        catch (err) {
            console.log(err);
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
        const { data } = await supabase.from('tags').select().eq('user_id', userId).eq('tag_id', tagID);
        //const [rows] = await pool.query(`SELECT * FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);

        if (data.length > 0) {
            return res.send(data[0]);
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

                const { data } = await supabase.from('tags').select().eq('tag_id', tagID);
                //const [rows, fields] = await pool.query(`SELECT * FROM tags WHERE tag_id=?`, [tagID]);
                
                if (data.length === 0) {
                    await supabase.from('tags').insert({user_id: userId, created_at: createDateTime(), edited_at: createDateTime(), tag_id: tagID, title: title, color: color})
                    //await pool.query(`INSERT INTO tags (user_id, created_at, edited_at, tag_id, title, color) VALUES (?, ?, ?, ?, ?, ?)`, [userId, createDateTime(), createDateTime(), tagID, title, color]);
                }

                if (imageID) {
                    await supabase.from('users_images_tags').insert({user_id: userId, image_id: imageID, tag_id: tagID});
                    //await pool.query(`INSERT INTO users_images_tags (user_id, image_id, tag_id) VALUES (?, ?, ?)`, [userId, imageID, tagID]);
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
            const { data } = await supabase.from('users_images_tags').select('tag_id').eq('user_id', userId).eq('image_id', imageID);
            //const [allTagsInImage, fields] = await pool.query(`SELECT tag_id FROM users_images_tags WHERE user_id=? AND image_id=?`, [userId, imageID]);
       
            const addedTags = JSON.parse(req.body.addedTags);

            //not in addedTags but in allTagsInImage
            const tagsToRemove = data.filter((elemTag) => !addedTags.some((tag) => tag.tag_id === elemTag.tag_id));
            
            //in addedTags but not in allTagsInImage
            const tagsToAdd = addedTags.filter((tag) => !data.some((existingTag) => existingTag.tag_id === tag.tag_id));

            const tagsAlreadyInImage = addedTags.filter((tag) => data.some((existingTag) => existingTag.tag_id === tag.tag_id));

            for (const tag of tagsToRemove) {
                await supabase.from('users_images_tags').delete().eq('user_id', userId).eq('image_id', imageID).eq('tag_id', tag.tag_id);
                //await pool.query(`DELETE FROM users_images_tags WHERE user_id=? AND image_id=? AND tag_id=?`, [userId, imageID, tag.tag_id]);
            }

             for (const tag of tagsAlreadyInImage) {
                await supabase.from('tags').update({title: tag.title, color: tag.color, edited_at: createDateTime()}).eq('user_id', userId).eq('tag_id', tag.tag_id);
                //await pool.query(`UPDATE tags SET title=?, color=?, edited_at=? WHERE user_id=? AND tag_id=?`, [tag.title, tag.color, createDateTime(), userId, tag.tag_id]);
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
            await supabase.from('tags').update({title: title, color: color, edited_at: createDateTime()}).eq('user_id', userId).eq('tag_id', tagID);
            //await pool.query(`UPDATE tags SET title=?, color=?, edited_at=? WHERE user_id=? AND tag_id=?`, [title, color, createDateTime(), userId, tagID])
            res.send(`Tag successfully updated`);
        }
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req);
    const tagID = req.params.id;

    if (isAuthenticated) {
        try {
            await supabase.from('tags').delete().eq('user_id', userId).eq('tag_id', tagID);
            //await pool.query(`DELETE FROM tags WHERE user_id=? AND tag_id=?`, [userId, tagID]);

            return res.send('Tag successfully deleted');
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