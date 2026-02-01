const path = require("path");
const { S3Client } = require('@aws-sdk/client-s3');
const { CloudFrontClient } = require("@aws-sdk/client-cloudfront");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

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

const cloudFront = new CloudFrontClient({
    accessKeyId: process.env.AWS_USER_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_USER_SECRET_ACCESS_KEY
})

function createSignedURL(title) {
    const imageURL = `https://d2ijutr0xv20w3.cloudfront.net/${title}`;
    const expiresInOneHour = new Date(Date.now() + 1000 * 60 * 60);
    const signedURL = getSignedUrl({
        url: imageURL,
        dateLessThan: expiresInOneHour,
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID
    });

    return signedURL;
}


module.exports={s3Client, cloudFront, createSignedURL}