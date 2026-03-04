const crypto = require('crypto');
require('dotenv').config();

function encrypt(text) {
    const key = Buffer.from(process.env.SYMM_KEY, "hex");
    const iv = Buffer.from(process.env.IV, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let ciphertext = cipher.update(text, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    return ciphertext;
}

module.exports = {encrypt}