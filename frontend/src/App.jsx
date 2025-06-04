import { useState, useEffect } from 'react';

function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      setLoggedIn(true);
      fetchMessages();
    }
  }, [token]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:7071/api/messages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('Sending...');

    const endpoint = mode === 'register' ? 'register' : 'login';

    try {
      const response = await fetch(`http://localhost:7071/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Something went wrong');
        return;
      }

      if (mode === 'login') {
        localStorage.setItem('token', data.token);
        setLoggedIn(true);
        fetchMessages();
        setMessage('Login successful!');
      } else {
        setMessage(data.message || 'Registration successful!');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setMessages([]);
    setEmail('');
    setPassword('');
    setMessage('');
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>{mode === 'register' ? 'Register' : 'Login'}</h1>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">{mode === 'register' ? 'Register' : 'Login'}</button>
        </form>

        <p>{message}</p>

        <button onClick={() => {
          setMode(mode === 'register' ? 'login' : 'register');
          setMessage('');
        }} style={{ marginTop: '1rem' }}>
          Switch to {mode === 'register' ? 'Login' : 'Register'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Your Messages</h1>
      <button onClick={handleLogout}>Logout</button>
  
      {/* Send Message Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const content = e.target.elements.message.value;
  
          if (!content.trim()) return;
  
          const response = await fetch('http://localhost:7071/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
          });
  
          if (response.ok) {
            e.target.reset();
            fetchMessages(); // refresh messages after sending
          }
        }}
        style={{ marginTop: '1rem' }}
      >
        <input
          type="text"
          name="message"
          placeholder="Type a message"
          style={{ padding: '0.5rem', width: '70%' }}
        />
        <button type="submit" style={{ marginLeft: '1rem' }}>Send</button>
      </form>
  
      <ul>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <li key={msg.id}>
              <strong>{msg.userEmail}:</strong> {msg.content}
            </li>
          ))
        )}
      </ul>
    </div>
  );
  
}

export default App;
