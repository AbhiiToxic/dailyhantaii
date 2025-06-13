const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID; // numeric chat id

if (!TOKEN) {
  console.error('BOT_TOKEN env var not set');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const linksPath = path.join(__dirname, 'links.json');
let links = [];

function loadLinks() {
  try {
    const data = fs.readFileSync(linksPath);
    links = JSON.parse(data);
  } catch (err) {
    links = [];
  }
}

function saveLinks() {
  fs.writeFileSync(linksPath, JSON.stringify(links, null, 2));
}

function nextNumber() {
  const numbers = links.map(l => parseInt(l.name, 10)).filter(n => !isNaN(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return (max + 1).toString();
}

loadLinks();

const states = {}; // chatId -> {action, step, data}

function isAdmin(id) {
  return !ADMIN_ID || id.toString() === ADMIN_ID;
}

bot.onText(/\/post/, (msg) => {
  if (!isAdmin(msg.from.id)) return;
  const chatId = msg.chat.id;
  const num = nextNumber();
  states[chatId] = { action: 'post', step: 'preview', data: { name: num } };
  bot.sendMessage(chatId, `Send preview link for button ${num}`);
});

bot.onText(/\/edit (\d+)/, (msg, match) => {
  if (!isAdmin(msg.from.id)) return;
  const chatId = msg.chat.id;
  const num = match[1];
  const existing = links.find(l => l.name === num);
  if (!existing) {
    bot.sendMessage(chatId, `Button ${num} not found.`);
    return;
  }
  states[chatId] = { action: 'edit', step: 'preview', data: { index: links.indexOf(existing) } };
  bot.sendMessage(chatId, `Send new preview link for button ${num}`);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const state = states[chatId];
  if (!state || !text) return;

  if (state.action === 'post') {
    if (state.step === 'preview') {
      state.data.preview = text;
      state.step = 'download';
      bot.sendMessage(chatId, 'Send download link');
    } else if (state.step === 'download') {
      state.data.download = text;
      links.push({ name: state.data.name, preview: state.data.preview, download: state.data.download });
      saveLinks();
      bot.sendMessage(chatId, 'Your button ready');
      delete states[chatId];
    }
  } else if (state.action === 'edit') {
    const entry = links[state.data.index];
    if (state.step === 'preview') {
      entry.preview = text;
      state.step = 'download';
      bot.sendMessage(chatId, 'Send new download link');
    } else if (state.step === 'download') {
      entry.download = text;
      saveLinks();
      bot.sendMessage(chatId, 'Button updated');
      delete states[chatId];
    }
  }
});
