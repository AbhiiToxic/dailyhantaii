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
   pip install -r requirements.txt
   ```
2. Set environment variables (or edit `bot.py`):
   - `BOT_TOKEN` – `yha bot id dalo`
   - `ADMIN_ID` – `yha admin id`
3. Start the bot:
   ```bash
   python bot.py
   ```

The bot reads and writes `links.json` in the repository root. It can be
deployed to platforms like Vercel using a Python runtime.

## JavaScript web site

This repository includes a small Express server. To serve the site locally run:

```bash
npm install
npm start
```

The server reads the same `links.json` file and the client renders the list. Set the `PORT` environment variable if your host requires a specific port.
