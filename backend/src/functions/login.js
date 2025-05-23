const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('telegram-db');
const container = database.container('Users');

const jwt = require('jsonwebtoken');


app.http('login', {
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

        // Find user by email
        const query = `SELECT * FROM Users u WHERE u.email = @email`;
        const { resources: users } = await container.items
            .query({ query, parameters: [{ name: '@email', value: email }] })
            .fetchAll();

        if (users.length === 0) {
            return {
                status: 401,
                body: JSON.stringify({ error: 'Invalid email or password.' })
            };
        }

        const user = users[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return {
                status: 401,
                body: JSON.stringify({ error: 'Invalid email or password.' })
            };
        }

        const token = jwt.sign(
            { email: user.email },                    // payload
            process.env.JWT_SECRET,                  // secret key
            { expiresIn: '2h' }                      // token expiry
          );
          
          return {
            status: 200,
            body: JSON.stringify({ message: 'Login successful', token })
          };
          
    }
});
// This code defines an Azure Function that handles user login. It checks if the provided email and password match a user in the Cosmos DB database. If they do, it returns a success message; otherwise, it returns an error message.