const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('telegram-db');
const container = database.container('Users');

app.http('register', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // Handle CORS preflight (OPTIONS request)
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

        const query = `SELECT * FROM Users u WHERE u.email = @email`;
        const { resources: existingUsers } = await container.items
            .query({ query, parameters: [{ name: '@email', value: email }] })
            .fetchAll();

        if (existingUsers.length > 0) {
            return {
                status: 409,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'User already exists.' })
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: email,
            email,
            password: hashedPassword
        };

        await container.items.create(newUser);

        return {
            status: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: 'User registered successfully',
                user: { email }
            })
        };
    }
});
