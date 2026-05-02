import { searchIndex } from "./search-index.js";

window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const resultsBox = document.getElementById("searchResults");

  if (!input || !resultsBox) return;

  function search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return searchIndex.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }

  function render(results) {
    resultsBox.innerHTML = "";

    if (results.length === 0) {
     resultsBox.innerHTML = `<div class="search-item">No results</div>`;
      resultsBox.style.display = "block";
      return;
    }

    results.forEach(item => {
      const div = document.createElement("div");
      div.className = "search-item";

      div.innerHTML = `
        <strong>${item.title}</strong>
        <small style="opacity:0.6; display:block;">
          ${item.type}
        </small>
      `;

      div.onclick = () => {
        window.location.href = item.url;
      };

      resultsBox.appendChild(div);
    });

    resultsBox.style.display = "block";
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const results = search(input.value);
      if (results[0]) window.location.href = results[0].url;
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-search")) {
      resultsBox.style.display = "none";
    }
  });
});