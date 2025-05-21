# 🧠 PartSelect Chat Agent

This project is a smart customer support chatbot designed for the PartSelect e-commerce site. It helps users get information about **refrigerator and dishwasher parts**, including installation help, compatibility checks, pricing info, and troubleshooting guidance.

---

## ✨ Features

- 💬 **Conversational UI** built with React
- 🧠 **Semantic search** using [Chroma](https://www.trychroma.com/) for product data
- 🤖 **OpenAI GPT-4 fallback** when no matching data is found in Chroma
- 🌙 **Dark mode** toggle
- ⚡ **Quick replies** for common user intents
- ✅ Scope-limited to **refrigerator and dishwasher** support

---

## 🚀 Getting Started
1. Clone the Repo

- git clone https://github.com/your-username/partselect-chat-agent.git
- cd partselect-chat-agent

2. Install Dependencies

- cd backend
- npm install

- cd ../partselect-chatbot
- npm install

3. Set Environment Variables
- In the backend/ directory, go to .env file and set openai api key:
- OPENAI_API_KEY=your_openai_api_key_here

4. Start Chroma (in a separate terminal)
- pip install chromadb
- chroma run

5. Load Product Data into Chroma
- node backend/loadPartsToChroma.js

6. Run Backend Server
- node backend/server.js

7. Run Frontend
- cd partselect-chatbot
- npm start
