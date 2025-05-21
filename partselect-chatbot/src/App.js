import React from 'react';
import Chat from './components/Chat';

function App() {
  return (
    <div style={styles.page}>
      <div style={styles.chatWrapper}>
        <Chat />
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '16px',
  },
  chatWrapper: {
    margin: '0 auto',
    width: '100%',
    maxWidth: '600px',
  }
};

export default App;