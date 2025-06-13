let links = [];

function renderList(list) {
  const container = document.getElementById("links-list");
  container.innerHTML = "";
  list.forEach(link => {
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.name;
    a.target = "_blank";
    a.className = "link-button";
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

// Theme toggle
const body = document.body;
const toggleBtn = document.getElementById("toggle-theme");

function setTheme(dark) {
  if (dark) {
    body.classList.add("dark");
  } else {
    body.classList.remove("dark");
  }
  localStorage.setItem("theme", dark ? "dark" : "light");
}

setTheme(localStorage.getItem("theme") === "dark");

toggleBtn.addEventListener("click", () => {
  const isDark = body.classList.contains("dark");
  setTheme(!isDark);
});
