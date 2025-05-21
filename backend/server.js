require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { ChromaClient } = require('chromadb');

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

const chroma = new ChromaClient();

async function getEmbedding(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-3-small',
      input: text,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.data[0].embedding;
}

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  const lastUserMessage = messages[messages.length - 1]?.content || '';

  try {
    const queryEmbedding = await getEmbedding(lastUserMessage);

    const collections = await chroma.listCollections();
    console.log('📂 Raw collections:', collections);

    const names = collections.map((c, i) => {
      if (!c.name) {
        console.warn(`⚠️ Collection ${i} is missing a name:`, c);
        return '[unnamed]';
      }
      return c.name;
    });
    console.log('✅ Collection names:', names);

    const collection = await chroma.getCollection({ name: 'partselect-docs' });

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    });

    console.log('📊 Raw query results:', JSON.stringify(results, null, 2));

    // ✅ FIX: Use results.documents[0]
    let retrievedContext = '';

    if (
      results &&
      Array.isArray(results.documents) &&
      results.documents.length > 0 &&
      Array.isArray(results.documents[0]) &&
      results.documents[0].length > 0
    ) {
      retrievedContext = results.documents[0].join('\n\n');
      console.log('🧠 Injected context:\n', retrievedContext);
    } else {
      console.warn('⚠️ No matches found from Chroma');
      retrievedContext = '';
    }

    const finalMessages = [
      {
        role: 'system',
        content: `You are a helpful customer support assistant for PartSelect.com.

You help users specifically with **refrigerator and dishwasher parts only**. You can answer questions about part installation, compatibility with specific appliance models, troubleshooting issues, and ordering support.

If available, use the following product information to answer the user's question:

========
${retrievedContext || 'No additional product info found.'}
========

If no relevant product information is provided, you may use your general knowledge from PartSelect.com— but stay strictly within the scope of refrigerators and dishwashers.

Do not answer questions about unrelated appliances or topics.`,


      },
      ...messages,
    ];

    console.log('🧾 Final prompt to OpenAI:', JSON.stringify(finalMessages, null, 2));

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: finalMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('❌ Chat error:', err.message);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

