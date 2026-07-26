# Odin Book API

This is a REST API for the social media platform inspired by Twitter. It allows users to post messages, follow users and explore content. This API is built with Express using PostgreSQL as the database.

## Pre-Requisites

- Node.js (v22.18.0+)
- PostgreSQL
- Redis
- GitHub Account (For GitHub OAuth)
- Cloudinary Account (For Image Uploads)

## Installation

1. Clone the repository

   ```
   git clone git@github.com:LazyEllis/odin-book-api.git
   ```

2. Install the project's dependencies

   ```
   npm install
   ```

3. Create a .env file and define the environmental variables

   ```env
    PORT=3000
    FRONTEND_URL="your-frontend-url"
    DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database>"
    TEST_DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<test_database>"
    JWT_SECRET="your-secret-jwt-key"
    GITHUB_CLIENT_ID="your-github-client-id"
    GITHUB_CLIENT_SECRET="your-github-client-secret"
    CLOUDINARY_URL="cloudinary://<api-key>:<api-secret>@<cloud-name>"
   ```

4. Run the database migrations and generate prisma

   ```
   npm run build
   ```

5. Run the development server

   ```
   npm run dev
   ```

## Contribute

- [Issue Tracker](https://github.com/LazyEllis/odin-book-api/issues)
- [Source Code](https://github.com/LazyEllis/odin-book-api)

## License

This project is licensed under the [MIT](LICENSE) License
