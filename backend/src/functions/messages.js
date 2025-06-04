const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('telegram-db');
const container = database.container('Messages');

app.http('messages', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    // ✅ Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing or invalid token' })
      };
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return {
        status: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const userEmail = decoded.email;

    if (request.method === 'POST') {
      const { content } = await request.json();

      if (!content) {
        return {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Message content is required' })
        };
      }

      const message = {
        id: Date.now().toString(),
        userEmail,
        content,
        createdAt: new Date().toISOString()
      };

      await container.items.create(message);

      return {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Message sent successfully' })
      };
    }

    // GET: fetch messages for this user
    const query = `SELECT * FROM Messages m WHERE m.userEmail = @userEmail ORDER BY m.createdAt DESC`;
    const { resources: messages } = await container.items
      .query({ query, parameters: [{ name: '@userEmail', value: userEmail }] })
      .fetchAll();

    return {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(messages)
    };
  }
});
