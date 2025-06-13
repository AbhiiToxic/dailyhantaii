import os
import json
from pathlib import Path
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

TOKEN = os.getenv('BOT_TOKEN', '8194013544:AAGQfMVe7z_Pu5KAJxicctcavJprSj1MFOg')
ADMIN_ID = os.getenv('ADMIN_ID', '7936963238')

links_path = Path(__file__).with_name('links.json')


def load_links():
    if links_path.exists():
        with open(links_path, 'r') as f:
            return json.load(f)
    return []


def save_links(data):
    with open(links_path, 'w') as f:
        json.dump(data, f, indent=2)


def next_number(data):
    numbers = [int(l['name']) for l in data if str(l.get('name', '')).isdigit()]
    return str(max(numbers) + 1 if numbers else 1)


def is_admin(user_id: int) -> bool:
    if ADMIN_ID == 'yha admin id':
        return True
    return str(user_id) == ADMIN_ID


links = load_links()
states = {}


async def post_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        return
    chat_id = update.effective_chat.id
    num = next_number(links)
    states[chat_id] = {'action': 'post', 'step': 'preview', 'data': {'name': num}}
    await update.message.reply_text(f'Send preview link for button {num}')


async def edit_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        return
    chat_id = update.effective_chat.id
    if not context.args:
        await update.message.reply_text('Usage: /edit <number>')
        return
    num = context.args[0]
    try:
        index = next(i for i, l in enumerate(links) if l['name'] == num)
    except StopIteration:
        await update.message.reply_text(f'Button {num} not found.')
        return
    states[chat_id] = {'action': 'edit', 'step': 'preview', 'data': {'index': index}}
    await update.message.reply_text(f'Send new preview link for button {num}')


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    text = update.message.text
    state = states.get(chat_id)
    if not state or not text:
        return
    if state['action'] == 'post':
        if state['step'] == 'preview':
            state['data']['preview'] = text
            state['step'] = 'download'
            await update.message.reply_text('Send download link')
        elif state['step'] == 'download':
            state['data']['download'] = text
            links.append({
                'name': state['data']['name'],
                'preview': state['data']['preview'],
                'download': state['data']['download']
            })
            save_links(links)
            await update.message.reply_text('Your button ready')
            del states[chat_id]
    elif state['action'] == 'edit':
        entry = links[state['data']['index']]
        if state['step'] == 'preview':
            entry['preview'] = text
            state['step'] = 'download'
            await update.message.reply_text('Send new download link')
        elif state['step'] == 'download':
            entry['download'] = text
            save_links(links)
            await update.message.reply_text('Button updated')
            del states[chat_id]


def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler('post', post_command))
    app.add_handler(CommandHandler('edit', edit_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.run_polling()


if __name__ == '__main__':
    main()
