const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

exports.postMessage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      res.set('Access-Control-Allow-Origin', '*');
      return res.status(405).send('Method Not Allowed');
    }

    const { content, userId } = req.body;

    if (!content || !userId) {
      res.set('Access-Control-Allow-Origin', '*');
      return res.status(400).send('Missing content or userId');
    }

    try {
      console.log('Received content:', content);
      console.log('Received userId:', userId);

      const postRef = await db.collection('posts').add({
        content,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Post saved with ID:', postRef.id);

      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Respond to this post in an expressive and pertinent way and include links to relevant topics: "${content}"` }],
        max_tokens: 150,
      });

      const reply = aiResponse.choices[0].message.content.trim();
      console.log('AI Response:', reply);

      await db.collection('replies').add({
        postId: postRef.id,
        reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.set('Access-Control-Allow-Origin', '*');
      return res.status(200).send({ postId: postRef.id, reply });
    } catch (error) {
      console.error('Error posting message:', error);
      res.set('Access-Control-Allow-Origin', '*');
      return res.status(500).send('Internal Server Error: ' + error.message);
    }
  });
});