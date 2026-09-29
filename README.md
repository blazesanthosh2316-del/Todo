# Todo API

A REST API built with Node.js, Express and MongoDB, with JWT authentication.
Each user can only see and change their own todos.

Built while learning backend development from scratch — I'm a React Native developer.

## Tech

- **Node.js + Express** — server and routing
- **MongoDB + Mongoose** — database and schemas
- **JWT** — stateless authentication
- **bcrypt** — password hashing
- **helmet + express-rate-limit** — security headers and brute-force protection
- **morgan** — request logging

## Routes

| Method | Route | Auth | What it does |
|---|---|---|---|
| POST | `/auth/signup` | — | Create an account |
| POST | `/auth/login` | — | Get a JWT (valid 7 days) |
| GET | `/auth/me` | ✅ | The logged-in user |
| GET | `/todos` | ✅ | My todos |
| GET | `/todos/:id` | ✅ | One of my todos |
| POST | `/todos` | ✅ | Create a todo |
| PUT | `/todos/:id` | ✅ | Update title and/or done |
| DELETE | `/todos/:id` | ✅ | Delete a todo |

Authenticated routes need a header: `Authorization: Bearer <token>`

## Structure

```
server.js              setup only
routes/                URLs
controllers/           logic
models/                Mongoose schemas
middleware/            auth, logging, errors
utils/                 small helpers
```

## Running it locally

```bash
npm install
```

Create a `.env` file:

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=a-long-random-string
PORT=3000
```

```bash
npm run dev
```

## Notes on security

- Passwords are stored only as bcrypt hashes; the field is `select: false` so it never leaves the database by accident
- Every todo query is filtered by the user id taken from the token, so one user cannot reach another's data (they get 404, not 403)
- Login is rate limited to 5 attempts per 15 minutes
- Errors return a safe message — stack traces are logged, never sent to the client
