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
router.use(bodyParser.json());

router.get('/', (req, res) => {
    const { isAuthenticated, userID } = getAuth(req);
    
    if (isAuthenticated) {
        pool.query(`SELECT * FROM tags WHERE userID=?`, [userID], (err, results, fields) => {
            if (results) {
                const tagsJSON = Object.values(JSON.parse(JSON.stringify(results)));
                return res.send(tagsJSON);
            }
            else {
                return res.send([]);
            }
        });
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.post('/add', (req, res) => {
    const { isAuthenticated, userID } = getAuth(req);

    if (isAuthenticated) {
        const title = req.body.title;
        const color = req.body.color;
        const tagID =  req.body.tagID;

        const [rows] = pool.query(`SELECT * FROM tags WHERE userID=? AND title=?`, [userID, title]);
        
        if (rows.length == 0) {
            try {
                pool.query(`INSERT INTO tags VALUES (?, ?, ?, ?)`, [userID, tagID, title, color]);
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            return res.send("Title already exists, please try again.");
        }   
    }
    else {
        return res.status(401).send('User not authenticated');
    }
});

router.post('/delete', (req, res) => {
    const { isAuthenticated, userID } = getAuth(req);
    const tagID = req.body.tagID;

    if (isAuthenticated) {
        try {
            pool.query(`DELETE FROM tags WHERE userID=? AND tagID=?`, [userID, tagID]);
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