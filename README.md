# Daily Hantai Telegram Bot

This bot lets an administrator manage the `links.json` file used by the web site.

## Features

- `/post` – create a new button. The bot will ask for the preview and download
  links one by one. The new entry is appended to `links.json` with the next
  numeric name.
- `/edit <number>` – edit an existing button. The bot will request new preview
  and download links for the selected entry.

Only the user ID specified in the `ADMIN_ID` environment variable can use these
commands. If `ADMIN_ID` is not set, anyone can manage the links.

## Deployment

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables:
   - `BOT_TOKEN` – Telegram bot token.
   - `ADMIN_ID` – your Telegram numeric user ID.
3. Start the bot:
   ```bash
   npm start
   ```

The bot reads and writes `links.json` in the repository root. Deploying to
Heroku works the same as any Node.js application.
