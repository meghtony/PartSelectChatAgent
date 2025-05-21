import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [collectedInputs, setCollectedInputs] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const messageRef = useRef(null);

  useEffect(() => {
    messageRef.current?.scrollTo(0, messageRef.current.scrollHeight);
  }, [messages, isLoading]);

  const isVague = (msg) => {
    const vague = ["i don't know", 'idk', 'not sure', 'no idea', 'unknown'];
    return vague.some(v => msg.toLowerCase().includes(v));
  };

  const sendMessage = async (finalMessage, metadata = null) => {
    const newMessages = [...messages, { role: 'user', content: finalMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setPendingPrompt(null);
    setCollectedInputs({});

    try {
      const res = await axios.post('http://localhost:5000/chat', {
        messages: newMessages,
      });

      const responseMessage = {
        role: 'assistant',
        content: res.data.reply,
      };

      if (metadata?.imageUrl) {
        responseMessage.imageUrl = metadata.imageUrl;
      }

      setMessages([...newMessages, responseMessage]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAssistantMessage = (content) => {
    setMessages((prev) => [...prev, { role: 'assistant', content }]);
  };

  const sendHelpfulLinks = () => {
    const helpfulMsg = `Here are some useful resources:\n\n🔍 [Find Your Part](https://www.partselect.com/Products/)\n🛠 [Repair Help](https://www.partselect.com/Repair/)`;
    sendAssistantMessage(helpfulMsg);
  };

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    if (pendingPrompt === 'compatibility-part') {
      if (isVague(userMessage)) {
        sendAssistantMessage("No worries! You can [look up your part number here](https://www.partselect.com/Brands/). Type in the part number when you are ready!");
        setPendingPrompt('compatibility-part');
        return;
      }
      setCollectedInputs({ part: userMessage });
      sendAssistantMessage('What is the model number or the refrigerator/dishwasher that you would like to check compatability for?');
      setPendingPrompt('compatibility-model');
      return;
    }

    if (pendingPrompt === 'compatibility-model') {
      if (isVague(userMessage)) {
        sendAssistantMessage("Totally okay! You can [find your model number here](https://www.partselect.com/Brands/). Type in the model number when you are ready!");
        setPendingPrompt('compatibility-model');
        return;
      }
      const full = `Is part ${collectedInputs.part} compatible with model ${userMessage}?`;
      sendMessage(full);
      return;
    }

    if (pendingPrompt === 'installation') {
      if (isVague(userMessage)) {
        sendAssistantMessage("That's okay! You can also describe the issue and I’ll try to help.");
        setPendingPrompt('installation');
        return;
      }
      const full = `How do I install part ${userMessage}?`;
      sendMessage(full);
      return;
    }

    if (pendingPrompt === 'about-part') {
      if (isVague(userMessage)) {
        sendAssistantMessage("No problem! If you find the part number later, I’ll be here to help. You can browse [PartSelect here](https://www.partselect.com/).");
        setPendingPrompt('about-part');
        return;
      }
      const imageUrl = `https://via.placeholder.com/200x150?text=Part+${encodeURIComponent(userMessage)}`;
      const full = `Tell me about part ${userMessage}`;
      sendMessage(full, { imageUrl });
      return;
    }

    sendMessage(userMessage);
  };

  const startPromptFlow = (type) => {
    if (type === 'compatibility') {
      sendAssistantMessage('What is the manufacturer part number of the refrigerator/dishwasher part that you would like to check compatability for (e.g., W10144820)?');
      setPendingPrompt('compatibility-part');
    } else if (type === 'installation') {
      sendAssistantMessage('What part do you need help installing? Input manufacturer part number (e.g., W10144820):');
      setPendingPrompt('installation');
    } else if (type === 'about') {
      sendAssistantMessage('Which part would you like to learn about? Input manufacturer part number(e.g., W10144820):');
      setPendingPrompt('about-part');
    }
  };

  const styles = {
    container: {
      backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9',
      color: darkMode ? '#f1f1f1' : '#000',
      borderRadius: '12px',
      padding: '16px',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
      textAlign: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    toggleButton: {
      padding: '6px 12px',
      borderRadius: '8px',
      backgroundColor: '#ccc',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
    },
    chatWindow: {
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #ccc',
    },
    messageArea: {
      flex: 1,
      padding: '12px',
      overflowY: 'auto',
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
    },
    message: {
      padding: '10px 14px',
      borderRadius: '16px',
      marginBottom: '10px',
      display: 'block',
      width: 'fit-content',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
    },
    user: {
      backgroundColor: darkMode ? '#3578e5' : '#d1eaff',
      color: darkMode ? '#fff' : '#000',
      alignSelf: 'flex-end',
      marginLeft: 'auto',
      textAlign: 'right',
      borderTopRightRadius: '4px',
      maxWidth: '75%',
    },
    assistant: {
      backgroundColor: darkMode ? '#444' : '#f0f0f0',
      color: darkMode ? '#fff' : '#000',
      alignSelf: 'flex-start',
      marginRight: 'auto',
      textAlign: 'left',
      borderTopLeftRadius: '4px',
      maxWidth: '75%',
    },
    inputRow: {
      display: 'flex',
      padding: '10px',
      borderTop: '1px solid #eee',
      backgroundColor: darkMode ? '#1e1e1e' : '#fafafa',
    },
    input: {
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? '#fff' : '#000',
    },
    button: {
      marginLeft: '8px',
      padding: '10px 16px',
      borderRadius: '8px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
    },
    buttonRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '12px',
      justifyContent: 'center',
    },
    quickButton: {
      padding: '6px 12px',
      borderRadius: '8px',
      backgroundColor: darkMode ? '#555' : '#e3f2fd',
      border: '1px solid #90caf9',
      cursor: 'pointer',
      fontSize: '14px',
      color: darkMode ? '#fff' : '#000',
    },
    clearButton: {
      padding: '6px 12px',
      borderRadius: '8px',
      backgroundColor: darkMode ? '#8b0000' : '#fbe9e7',
      border: '1px solid #ffab91',
      cursor: 'pointer',
      fontSize: '14px',
      color: darkMode ? '#fff' : '#000',
    },
    image: {
      marginTop: '6px',
      borderRadius: '8px',
      maxWidth: '200px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>PartSelect Chat Agent</h2>

      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <button onClick={() => setDarkMode(!darkMode)} style={styles.toggleButton}>
          {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div style={styles.buttonRow}>
        <button onClick={() => sendHelpfulLinks()} style={styles.quickButton}>Helpful Links</button>
        <button onClick={() => startPromptFlow('compatibility')} style={styles.quickButton}>Check Compatibility</button>
        <button onClick={() => startPromptFlow('installation')} style={styles.quickButton}>Installation Help</button>
        <button onClick={() => startPromptFlow('about')} style={styles.quickButton}>About a Specific Part</button>
        <button onClick={() => setMessages([])} style={styles.clearButton}>Clear Chat</button>
      </div>

      <div style={styles.chatWindow}>
        <div style={styles.messageArea} ref={messageRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.user : styles.assistant),
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {msg.imageUrl && <img src={msg.imageUrl} alt="Part" style={styles.image} />}
            </div>
          ))}
          {isLoading && (
            <div style={{ ...styles.message, ...styles.assistant }}>
              <span className="typing-dots">● ● ●</span>
            </div>
          )}
        </div>

        <div style={styles.inputRow}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            style={styles.input}
          />
          <button onClick={handleSend} style={styles.button}>Send</button>
        </div>
      </div>

      <style>{`
        .typing-dots {
          display: inline-block;
          font-size: 20px;
          letter-spacing: 2px;
          animation: blink 1.2s infinite;
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
