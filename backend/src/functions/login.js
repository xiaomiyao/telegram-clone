const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('telegram-db');
const container = database.container('Users');

app.http('login', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      };
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email and password are required.' })
      };
    }

    // Look up the user
    const query = `SELECT * FROM Users u WHERE u.email = @email`;
    const { resources: users } = await container.items
      .query({ query, parameters: [{ name: '@email', value: email }] })
      .fetchAll();

    if (users.length === 0) {
      return {
        status: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid email or password.' })
      };
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        status: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid email or password.' })
      };
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Login successful', token })
    };
  }
});
