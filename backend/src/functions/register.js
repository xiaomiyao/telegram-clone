const { app } = require('@azure/functions');

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

        if (email === "test@example.com") {
            return {
                status: 409,
                body: JSON.stringify({ error: 'User already exists.' })
            };
        }

        return {
            status: 201,
            body: JSON.stringify({
                message: 'User registered successfully',
                user: { email }
            })
        };
    }
});
