const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('telegram-db');
const container = database.container('Users');

const bcrypt = require('bcryptjs');


app.http('register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const { email, password } = await request.json();

        if (!email || !password) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'Email and password are required.' })
            };
        }

        // Check if user already exists
        const query = `SELECT * FROM Users u WHERE u.email = @email`;
        const { resources: existingUsers } = await container.items
            .query({ query, parameters: [{ name: '@email', value: email }] })
            .fetchAll();

        if (existingUsers.length > 0) {
            return {
                status: 409,
                body: JSON.stringify({ error: 'User already exists.' })
            };
        }

        // Create user
        // Hash the password before saving
const hashedPassword = await bcrypt.hash(password, 10);

const newUser = {
  id: email,
  email,
  password: hashedPassword
};


        await container.items.create(newUser);

        return {
            status: 201,
            body: JSON.stringify({
                message: 'User registered successfully',
                user: { email }
            })
        };
    }
});
