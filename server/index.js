const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { pool } = require("./db");
const { verifyWebhook } = require('@clerk/express/webhooks');
const { clerkClient, clerkMiddleware, getAuth } = require('@clerk/express');
const images = require('./routes/images');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(clerkMiddleware());
app.use("/images", images);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type

    console.log(`Length is: ${id.length}`);

    if (eventType === "user.created") {
        try {
          pool.query(`INSERT INTO users (user_id) VALUES (?)`, [id]);
        }
        catch (err) {
            console.error('Error verifying webhook:', err)
            return res.status(400).send('Error verifying webhook')
        }
    }
    else if (eventType === "user.deleted") {
        try {
            pool.query(`UPDATE users SET deleted_at=? WHERE user_id=?`, 
              [new Date().toISOString().slice(0, 19).replace('T', ' '), id]);
        }
        catch(err) {
            console.error('Error verifying webhook:', err)
            return res.status(400).send('Error verifying webhook')
        }
    }

    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    return res.send('Webhook received')
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).send('Error verifying webhook')
  }
})

app.listen(port, () => `Listening on http://localhost:${port}`);

