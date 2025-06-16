# Daily Hantai Site

This repository contains a small Express web server that serves static pages from this directory. Links can be stored either in a local `links.json` file or in a MongoDB collection. If the `MONGO_URL` environment variable is provided, the server will use MongoDB to store and retrieve entries. Otherwise it falls back to the local JSON file. An admin panel at `/admin` lets you add new entries.

## Setup

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and update `MONGO_URL` with your connection string:
   ```bash
   cp .env.example .env
   # edit .env to provide your credentials
   ```
3. Start the server:
   ```bash
   npm start
   ```

Set the `PORT` environment variable if your host requires a specific port. The admin panel is protected with HTTP Basic authentication; provide `ADMIN_USER` and `ADMIN_PASS` environment variables before starting the server.
To store data in MongoDB instead of the local JSON file, set `MONGO_URL` in the `.env` file to a valid MongoDB connection string before starting the server.
