const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');

app.http('messages', {
    methods: ['GET'],
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

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Later: use decoded.email to fetch user messages from DB

            return {
                status: 200,
                body: JSON.stringify({
                    message: `Welcome, ${decoded.email}! You are authenticated.`
                })
            };
        } catch (err) {
            return {
                status: 403,
                body: JSON.stringify({ error: 'Invalid or expired token' })
            };
        }
    }
});
