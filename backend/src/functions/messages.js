const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('telegram-db');
const container = database.container('Messages');

app.http('messages', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: 401,
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
                body: JSON.stringify({ error: 'Invalid or expired token' })
            };
        }

        const userEmail = decoded.email;

        if (request.method === 'POST') {
            const { content } = await request.json();

            if (!content) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Message content is required' })
                };
            }

            const message = {
                id: Date.now().toString(), // unique id
                userEmail,
                content,
                createdAt: new Date().toISOString()
            };

            await container.items.create(message);

            return {
                status: 201,
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
            body: JSON.stringify(messages)
        };
    }
});
