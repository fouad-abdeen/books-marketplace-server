# Welcome to the Books Marketplace Server!

This is the backend for "Souk el Kotob", a marketplace for book lovers. Our APIs handle all the functions of the marketplace.

## Table of Contents

- [Introduction](#introduction)
- [Project Features and User Stories](#project-features-and-user-stories)
- [Technologies](#technologies)
- [Dependencies](#dependencies)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [MongoDB](#mongodb)
  - [AWS S3](#aws-s3)
  - [Brevo](#brevo)
- [Configuration](#configuration)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Architecture Overview](#architecture-overview)
- [Design Pattern: Controller-Service-Repository](#design-pattern-controller-service-repository)

## Introduction

Books Marketplace is currently in its early stages, with the backend under active development. The goal is to create a user-friendly platform for buying and selling books, connecting readers, and fostering a community of book enthusiasts. The focus is on building robust server-side functionalities, laying the foundation for the upcoming frontend.

## Technologies

- **Runtime:** Node.js
- **Web Framework:** Express
- **Language:** JavaScript (ES6+)
- **Database:** MongoDB
- **Authentication:** JWT and Bcrypt
- **Mail Service:** Brevo
- **File Storage:** AWS S3

## Dependencies

- **AWS SDK for S3:** [aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3)

  - Used for interacting with AWS S3 for file storage.

- **AWS S3 Request Presigner:** [@aws-sdk/s3-request-presigner](https://www.npmjs.com/package/@aws-sdk/s3-request-presigner)

  - A utility for presigning S3 requests.

- **Axios:** [axios](https://www.npmjs.com/package/axios)

  - A promise-based HTTP client for making requests to external APIs.

- **Bcrypt:** [bcrypt](https://www.npmjs.com/package/bcrypt)

  - Used for hashing passwords for secure storage.

- **Class Validator:** [class-validator](https://www.npmjs.com/package/class-validator)

  - Provides decorators for input validation.

- **Compression:** [compression](https://www.npmjs.com/package/compression)

  - Middleware to compress HTTP responses.

- **Cookie Parser:** [cookie-parser](https://www.npmjs.com/package/cookie-parser)

  - Parses and handles HTTP cookies.

- **CORS:** [cors](https://www.npmjs.com/package/cors)

  - Middleware to enable Cross-Origin Resource Sharing.

- **Dotenv:** [dotenv](https://www.npmjs.com/package/dotenv)

  - Loads environment variables from a .env file.

- **Express:** [express](https://www.npmjs.com/package/express)

  - Web application framework for Node.js.

- **Express HTTP Context:** [express-http-context](https://www.npmjs.com/package/express-http-context)

  - Enables access to contextual data across middleware and routes.

- **Helmet:** [helmet](https://www.npmjs.com/package/helmet)

  - Middleware to enhance HTTP security headers.

- **JSON Web Token (JWT):** [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

  - Generates and verifies JSON web tokens.

- **Mongoose:** [mongoose](https://www.npmjs.com/package/mongoose)

  - MongoDB object modeling tool.

- **Morgan:** [morgan](https://www.npmjs.com/package/morgan)

  - HTTP request logger middleware.

- **NanoID:** [nanoid](https://www.npmjs.com/package/nanoid)

  - A tiny, secure, URL-friendly unique string ID generator.

- **Swagger UI Express:** [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)

  - Middleware to serve Swagger UI for API documentation.

- **Winston:** [winston](https://www.npmjs.com/package/winston)
  - Versatile logging library for Node.js.

## Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) - Node Package Manager
- [MongoDB](https://www.mongodb.com/try/download/community) (optional)

Ensure you have accounts on Tebi (for file storage) and Brevo (for mail service)

- [Tebi](https://tebi.io/)
- [Brevo](https://developers.brevo.com/)

## Setup

### MongoDB

1. Install MongoDB by choosing one of the below options:

- Download the appropriate MongoDB version for your operating system from the [MongoDB website](https://www.mongodb.com/try/download/community) and follow their installation instructions.
- Create a free MongoDB cluster (shared one) on [Atlas](https://www.mongodb.com/cloud/atlas).
- Install MongoDB using [Docker](https://hub.docker.com/_/mongo/) if you prefer to use Docker.

2. To connect to and control MongoDB:

- Use MongoDB Compass ([install it here](https://www.mongodb.com/try/download/compass) if you don't already have it installed).
- You can use MongoDB Atlas if you're using a deployed MongoDB cluster.

### Tebi

1. Create a free account on [the platform](https://tebi.io/).

2. Add a bucket with the following name: **books-marketplace**.

### Brevo

1. Create a free account on [the platform](https://developers.brevo.com/).

2. Generate a new API key to access the mail service.

## Getting Started

1. Clone this repository: `git clone https://github.com/fouad-abdeen/books-marketplace-server.git`
2. Change into the project directory: `cd books-marketplace-server`

## Configuration

Before running the server, configure the environment variables. Create a `.env` file in the root of the project with the following content (make sure to replace the value for each variable):

```env
# JWT Secret Key
JWT_SECRET=[YOUR_SECRET_KEY]

# AWS S3 Configuration
AWS_S3_ACCESS_KEY_ID=[YOUR_S3_ACCESS_KEY_ID]
AWS_S3_SECRET_ACCESS_KEY=[YOUR_S3_SECRET_ACCESS_KEY]

# Brevo Mail Service Configuration
BREVO_SENDER_NAME=[YOUR_NAME]
BREVO_SENDER_MAIL_ADDRESS=[YOUR_MAIL_ADDRESS]
BREVO_API_KEY=[YOUR_BREVO_API_KEY]
```

Notes:

- To configure AWS S3, get the credentials from your Tebi account, use either a master key or a bucket key.
- Make sure to add the below variable to .env file if you're using a MongoDB cluster on Atlas:

  MONGODB_HOST=mongodb+srv://[USERNAME]:[PASSWORD]@sandbox.pim8u.mongodb.net/

- To view default env variables, go to `/src/core/config/env.config.ts`. You can replace any other variable if needed.

## Installation

Install project dependencies:

```bash
npm install
```

## Running the Server

Before starting the server, you may want to seed the database with a list of users. To do this, run the following command:

```bash
npm run seed-database
```

This command will populate your database with the users defined in the `./database-scripts/database-seed.ts` file.

To start the server in normal mode:

```bash
npm start
```

To start the server in production mode:

```bash
npm run prod
```

To start the server in development mode:

```bash
npm run dev
```

The server will be running at http://localhost:3030 by default.

## API Documentation

The API documentation for Souk el Kotob's backend is generated using Swagger. You can access the Swagger UI by visiting the following link:

[Swagger API Documentation](http://localhost:3030/docs)

This documentation provides a detailed overview of the available endpoints, request/response schemas, and allows you to interact with the API directly from the Swagger UI.

Note: Make sure the backend server is running before accessing the Swagger documentation.
