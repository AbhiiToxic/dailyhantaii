# Daily Hantai Site

This repository contains a small Express web server that serves static pages from this directory and reads `links.json` to display available links. An admin panel at `/admin` lets you add new entries.

## Setup

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```

Set the `PORT` environment variable if your host requires a specific port. The admin panel is protected with HTTP Basic authentication; provide `ADMIN_USER` and `ADMIN_PASS` environment variables before starting the server.
