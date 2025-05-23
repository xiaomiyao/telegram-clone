const { app } = require('@azure/functions');

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

        // 🔐 Fake login logic
        if (email === "test@example.com" && password === "123456") {
            return {
                status: 200,
                body: JSON.stringify({ message: 'Login successful', token: 'FAKE-JWT-TOKEN' })
            };
        }

        return {
            status: 401,
            body: JSON.stringify({ error: 'Invalid email or password' })
        };
    }
});
