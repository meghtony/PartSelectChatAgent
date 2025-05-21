require('dotenv').config();
const { ChromaClient } = require('chromadb');
const axios = require('axios');

const client = new ChromaClient();

async function getEmbedding(text) {
  const res = await axios.post(
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
  return res.data.data[0].embedding;
}

async function loadDocs() {
  try {
    // 🔁 Delete old collection if it exists
    try {
      await client.deleteCollection({ name: 'partselect-docs' });
      console.log('🗑️ Deleted existing partselect-docs collection');
    } catch (e) {
      console.warn('⚠️ Collection did not exist or couldn’t be deleted');
    }

    const collection = await client.createCollection({ name: 'partselect-docs' });
    console.log('📁 Created collection partselect-docs');

    // ✅ Add your parts here
    const docs = [
      {
        id: '001',
        text: 'Part W10312345 is a dishwasher spray arm for Whirlpool model WDT720PADM1. It distributes water during the wash cycle and costs $22.49.',
      },
      {
        id: '002',
        text: 'Part WPW10321304 is a Refrigerator Door Shelf Bin that is compatible with any Manufactured by Whirlpool for Whirlpool, Kenmore, Maytag, KitchenAid refrigerators. It costs $36.08',
      },
      {
        id: '003',
        text: 'Part WPW10662129 is a capacitor that is compatible with Whirlpool, Kenmore, Amana, KitchenAid refrigerators. It provides the voltage or energy current required to start the compressor and keep it running. It allows the compressor in your appliance to easily cycle on and off. This capacitor mounts directly onto the compressor starting relay. If the capacitor is faulty the compressor may get unusually hot and draw excessive amperage. It the compressor overheats, it may fail to run until it cools down again. The compressor may also get noisy from overheating. If this part is totally electrically open, it is defective (often due to overheating) and needs to be replaced. The part measures 1 inch by 1-1/2 inches, and is constructed of plastic with two metal wire terminals. This item includes 1 capacitor, sold individually. This part comes in black. It costs $34.89',
      },
    ];

    // 🔁 Embed and insert each doc
    for (const doc of docs) {
      console.log('🔹 Embedding:', doc.text);
      const embedding = await getEmbedding(doc.text);
      await collection.add({
        ids: [doc.id],
        embeddings: [embedding],
        documents: [doc.text],
        metadatas: [{ content: doc.text }],
      });
    }

    console.log('✅ All documents embedded and added to Chroma!');
  } catch (err) {
    console.error('❌ Error loading documents:', err);
  }
}

loadDocs();
