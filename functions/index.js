const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

async function generateNews() {
  try {
    const newsResponse = await axios.get(NEWS_API_URL);
    const articles = newsResponse.data.articles;

    for (const article of articles) {
      const { title, description, urlToImage, publishedAt } = article;

      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'Provide a detailed and insightful analysis of this news article.' }, { role: 'user', content: description }],
        max_tokens: 150,
      });

      const commentary = aiResponse.choices[0].message.content.trim();

      await db.collection('news').add({
        title,
        description,
        urlToImage,
        publishedAt,
        commentary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('News articles and AI opinions successfully added to Firestore.');
    return null;
  } catch (error) {
    console.error('Error generating news:', error);
    throw new functions.https.HttpsError('internal', 'Unable to generate news');
  }
}

// Scheduled function to run every 24 hours
exports.scheduledGenerateNews = functions.pubsub.schedule('every 24 hours').onRun(generateNews);

// HTTP function to trigger manually
exports.generateNewsNowHttp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await generateNews();
      res.status(200).send('News generation triggered successfully.');
    } catch (error) {
      console.error('Error triggering news generation:', error);
      res.status(500).send('Error triggering news generation.');
    }
  });
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

exports.deletePost = functions.https.onCall(async (data, context) => {
  const { postId, userId } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Request had invalid credentials.');
  }

  if (!postId || !userId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with the correct arguments.');
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const post = postSnapshot.data();

    if (post.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'User is not authorized to delete this post.');
    }

    await postRef.delete();

    return { message: 'Post deleted successfully.' };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new functions.https.HttpsError('unknown', 'An unknown error occurred.');
  }
});



exports.replyToPost = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }
        const { postId, content, userId } = req.body;

        try {
            const postRef = db.collection('posts').doc(postId).collection('replies').doc();
            await postRef.set({
                content,
                userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            res.status(200).send('Reply added successfully');
        } catch (error) {
            res.status(500).send('Error adding reply: ' + error.message);
        }
    });
});


