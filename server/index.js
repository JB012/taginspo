const express = require("express");
const app = express();
const port = 3000;
const { createDateTime } = require("./utils");
const { verifyWebhook } = require('@clerk/express/webhooks');
const {clerkMiddleware } = require('@clerk/express');
const images = require('./routes/images');
const tags = require('./routes/tags');
const cors = require('cors');
const { supabase } = require('./sb');
require('dotenv').config();

app.use(cors());
app.use(clerkMiddleware());
app.use("/images", images);
app.use("/tags", tags);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type

    console.log(`Length is: ${id.length}`);

    if (eventType === "user.created") {
        try {
          const {data} = await supabase.from('users').select().eq("user_id", id);
          //const [rows, fields] = await pool.query(`SELECT user_id FROM users WHERE user_id=?`, [id]);

          if (data.length > 0) {
            await supabase.from('users').update({created_at: createDateTime(), deleted_at: null}).eq('user_id', id);
            //await pool.query(`UPDATE users SET created_at=? AND deleted_at=? WHERE user_id=?`, [createDateTime(), null]);
          }
          else {
            await supabase.from('users').insert({user_id: id, created_at: createDateTime(), deleted_at: null});
            //await pool.query(`INSERT INTO users (user_id, created_at, deleted_at) VALUES (?, ?, ?)`, [id, createDateTime(), null]);
          }
        }
        catch (err) {
            console.error('Error verifying webhook:', err)
            return res.status(400).send('Error verifying webhook')
        }
    }
    else if (eventType === "user.deleted") {
        try {
          await supabase.from('users').update({deleted_at: createDateTime()}).eq('user_id', id);
            //pool.query(`UPDATE users SET deleted_at=? WHERE user_id=?`, 
             // [createDateTime(), id]);
        }
        catch(err) {
            console.error('Error verifying webhook:', err)
            return res.status(400).send('Error verifying webhook')
        }
    }

    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    //console.log('Webhook payload:', evt.data)

    return res.send('Webhook received')
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).send('Error verifying webhook')
  }
})

app.listen(port, () => `Listening on http://localhost:${port}`);

