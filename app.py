from pathlib import Path
import json
from flask import Flask, render_template, request

app = Flask(__name__, static_url_path='', static_folder='.')
links_path = Path(__file__).with_name('links.json')


def load_links():
    if links_path.exists():
        with open(links_path, 'r') as f:
            return json.load(f)
    return []


@app.route('/')
def index():
    query = request.args.get('q', '')
    data = load_links()
    if query:
        q = query.lower()
        data = [l for l in data if q in l.get('name', '').lower()]
    def parse_num(l):
        n = l.get('name')
        return int(n) if str(n).isdigit() else 0
    data = sorted(data, key=parse_num, reverse=True)
    return render_template('index.html', links=data, query=query)


@app.route('/view')
def view():
    name = request.args.get('name')
    preview = request.args.get('preview')
    download = request.args.get('download')
    return render_template('view.html', name=name, preview=preview, download=download)


if __name__ == '__main__':
    import os
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
