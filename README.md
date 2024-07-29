# NestJS Test

This project demonstrates a simple REST API using NestJS with MongoDB, featuring JWT authentication and e2e testing.

## Project Description

This project is a simple API for a simple social platform, where end-users can create an account and then make a post as that user.
The posts are linked to the user account.

Since making a secure API endpoints is not stated in the challenge criteria, some common sense security features are not implemented:

- Password hashing, salting (password is just stored as is on the database)
- Refresh token after updating the user data
- Access control (anyone can see and edit everyone else's data, as long as they have the JWT)
- Token invalidation

The e2e test also only covers the `login` endpoint in the auth collection, since the challenge criteria only ask for that.
Other `.spec.ts` that comes from NestJS are also removed.

## Project Structure

- **Users Module**: Handles CRUD operations for users.
- **Posts Module**: Handles CRUD operations for posts, which are related to users.
- **Auth Module**: Manages authentication using JWT tokens.
- **E2E Testing**: Ensures the authentication endpoints work correctly.

## Why This Pattern?

The modular pattern allows for a clean separation of concerns. Each module encapsulates its functionality.
This pattern makes it easier to maintain and discern what each module does.

## Running Locally

```bash
npm install
npm run start
```

## Postman Collection

The file `postman-collection.js` is the exported Postman Collection containing the API documentation.
