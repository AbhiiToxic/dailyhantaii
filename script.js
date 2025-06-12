const links = [
  { name: "Telegram Channel", url: "https://t.me/bishnoi_botz" },
  { name: "Instagram", url: "https://instagram.com" }
];

function renderList(filtered) {
  const container = document.getElementById("links-list");
  container.innerHTML = "";
  filtered.forEach(link => {
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.name;
    a.target = "_blank";
    container.appendChild(a);
  });
}

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const q = document.getElementById("query").value.toLowerCase();
  const filtered = links.filter(l => l.name.toLowerCase().includes(q));
  renderList(filtered);
});

renderList(links);
