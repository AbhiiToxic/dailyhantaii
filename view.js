const params = new URLSearchParams(window.location.search);

document.getElementById('preview-btn').href = params.get('preview');
document.getElementById('download-btn').href = params.get('download');

const name = params.get('name');
if (name) {
  document.getElementById('title').textContent = name;
}
