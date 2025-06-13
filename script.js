let links = [];

function renderList(list) {
  const container = document.getElementById("links-list");
  container.innerHTML = "";

  const sorted = [...list].sort((a, b) => {
    const an = parseInt(a.name, 10);
    const bn = parseInt(b.name, 10);
    if (isNaN(an) || isNaN(bn)) return 0;
    return bn - an;
  });

  sorted.forEach(link => {
    const a = document.createElement("a");
    const params = new URLSearchParams({
      preview: link.preview,
      download: link.download,
      name: link.name
    });
    a.href = `view.html?${params.toString()}`;
    a.className = "link-button";

    a.textContent = link.name;

    container.appendChild(a);
  });
}

function loadLinks() {
  fetch('links.json')
    .then(response => response.json())
    .then(data => {
      links = data;
      renderList(links);
    });
}

function filterLinks(q) {
  const query = q.toLowerCase();
  return links.filter(l => l.name.toLowerCase().includes(query));
}

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const q = document.getElementById("query").value;
  renderList(filterLinks(q));
});

loadLinks();

// menu toggle
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('open');
});
