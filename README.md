# Telegram Clone

A modern messaging application built with Create React App and Azure Functions.

## Features

- **Frontend**

  - Built with [Create React App](https://github.com/facebook/create-react-app)
  - Uses React Router for navigation between pages:
    - **Login Page** for user authentication
    - **Register Page** for new user sign-up
    - **Chat Page** for messaging

- **Backend (Azure Functions)**

  - **Register Function**: Handles new user registration. It hashes passwords and stores user data in Azure Cosmos DB ([register.js](./backend/src/functions/register.js)).
  - **Login Function**: Authenticates users by comparing hashed passwords and provides a JWT for session management ([login.js](./backend/src/functions/login.js)).
  - **Messages Function**: Validates JWT tokens to secure access to user messages ([messages.js](./backend/src/functions/messages.js)).

- **Database**
  - Utilizes Azure Cosmos DB for secure storage of user information.

## Getting Started

1. **Install dependencies for the frontend:**
   ```bash
   npm install
   ```
2. **Start the frontend:**
   ```bash
   npm start
   ```
3. **Install dependencies for the backend and start Azure Functions:**
   ```bash
   cd backend
   npm install
   npm start
   ```

## Testing

- Run tests using:
  ```bash
  npm test
  ```

## Deployment

Refer to the [Create React App deployment documentation](https://facebook.github.io/create-react-app/docs/deployment) for details.

For additional details on functionality, see:

- [register.js](./backend/src/functions/register.js)
- [login.js](./backend/src/functions/login.js)
- [messages.js](./backend/src/functions/messages.js)
