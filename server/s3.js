const path = require("path");
const { S3Client } = require('@aws-sdk/client-s3');

require("dotenv").config({
    path: path.resolve(__dirname, ".env")
});

const s3Client = new S3Client({
    region: 'us-east-1', 
    credentials: {
        accessKeyId: process.env.AWS_USER_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_USER_SECRET_ACCESS_KEY
    }
});

module.exports={s3Client}