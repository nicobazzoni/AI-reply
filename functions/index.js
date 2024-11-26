const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

// Helper function to generate news articles
async function generateNews() {
  const topics = [
    'Climate Change',
    'Economic Trends',
    'Technological Innovations',
    'Global Conflicts',
    'Cultural Shifts',
    'Health and Wellness',
    'Political Developments',
  ];

  for (const topic of topics) {
    const prompt = `Write a brief, informative news snippet about ${topic} and include a relevant URL to a credible source.`;

    try {
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      });

      const articleContent = aiResponse.choices[0].message.content.trim();
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatch = articleContent.match(urlRegex);
      const url = urlMatch ? urlMatch[0] : '';

      if (url) {
        await db.collection('news').add({
          topic,
          content: articleContent.replace(url, '').trim(),
          url,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`News article for topic "${topic}" added successfully.`);
      } else {
        console.log(`No valid URL found for topic: ${topic}`);
      }
    } catch (error) {
      console.error(`Error generating news for topic "${topic}":`, error.message);
    }
  }
}

// HTTP Function to trigger news generation
exports.generateNewsNowHttp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await generateNews();
      res.status(200).send('News generation triggered successfully.');
    } catch (error) {
      console.error('Error triggering news generation:', error.message);
      res.status(500).send('Error triggering news generation.');
    }
  });
});

// HTTP Function to handle posting messages
exports.postMessage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).send('Missing content or userId');
    }

    try {
      console.log('Received post content:', content);
      const postRef = await db.collection('posts').add({
        content,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Respond to this: "${content}"` }],
        max_tokens: 300,
      });

      const reply = aiResponse.choices[0].message.content.trim();

      await db.collection('replies').add({
        postId: postRef.id,
        reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).send({ postId: postRef.id, reply });
    } catch (error) {
      console.error('Error in postMessage function:', error.message);
      res.status(500).send('Internal Server Error: ' + error.message);
    }
  });
});

// Callable Function to delete posts
exports.deletePost = functions.https.onCall(async (data, context) => {
  const { postId, userId } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Request had invalid credentials.');
  }

  if (!postId || !userId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing postId or userId.');
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const post = postSnapshot.data();

    if (post.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'User not authorized to delete this post.');
    }

    await postRef.delete();
    return { message: 'Post deleted successfully.' };
  } catch (error) {
    console.error('Error deleting post:', error.message);
    throw new functions.https.HttpsError('unknown', 'An unknown error occurred.');
  }
});

// HTTP Function to reply to posts
exports.replyToPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { postId, content, userId } = req.body;

    if (!postId || !content || !userId) {
      return res.status(400).send('Missing postId, content, or userId');
    }

    try {
      const replyRef = db.collection('posts').doc(postId).collection('replies').doc();
      await replyRef.set({
        content,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(200).send('Reply added successfully');
    } catch (error) {
      console.error('Error in replyToPost function:', error.message);
      res.status(500).send('Error adding reply: ' + error.message);
    }
  });
});