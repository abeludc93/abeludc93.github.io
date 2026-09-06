function filterPosts(category) {
  const posts = document.querySelectorAll('.post-card');
  posts.forEach(post => {
    const categories = post.dataset.category.split(',');
    if (category === 'all' || categories.includes(category)) {
      post.style.display = 'block';
    } else {
      post.style.display = 'none';
    }
  });
}

function initRender(containerId='markdown-content', urlParam='post', folder='articles/') {

  document.addEventListener("DOMContentLoaded", () => {    
    
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get(urlParam);
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado.`);
        return;
    }

    if (!fileName) {
      container.innerHTML = "<h1>Error</h1><p>No post specified.</p>";
      document.title = "Post Not Found";
      return;
    }

    const filePath = `${folder}${fileName}.md`;

    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error("File not found");
        return response.text();
      })
      .then(markdownText => {
        // Título
        const match = markdownText.match(/^#\s+(.*)/m);
        document.title = match ? `${match[1]} - Abel Pampín` : `${fileName} - Abel Pampín`;

        // Render MD
        container.innerHTML = marked.parse(markdownText);
        
        // Render LaTeX
        renderMathInElement(container, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError : false
        });
      })
      .catch(err => {
        container.innerHTML = `<h1>404</h1><p>The content <em>${fileName}</em> does not exist.</p>`;
        document.title = "404 - Not Found";
        console.error(err);
      });
  });
}

function initCatalog(folder='articles/', fileName='index'){

  document.addEventListener("DOMContentLoaded", () => {
  
    const gridCatalog = document.getElementById('posts-grid');
    const filterDiv = document.getElementById('filter-buttons');
    const filePath = `${folder}${fileName}.json`;

    let allPosts = [];
    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error("Could not read JSON index file.");
        return response.json();
      })
      .then(data => {
        allPosts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        populateFilters(allPosts, filterDiv);
        renderPosts(allPosts, gridCatalog);
      })
      .catch(err => {
        gridCatalog.innerHTML = `<p>Error loading catalog: ${err.message}</p>`;
      });

  });

}

function populateFilters(posts, filterCtn) {
  
  const categoriesSet = new Set();
  posts.forEach(post => {
    post.categories.forEach(cat => categoriesSet.add(cat));
  });

  const sortedCategories = Array.from(categoriesSet).sort();
  sortedCategories.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.addEventListener("click", (e) => filterPosts(category));
    filterCtn.appendChild(btn);
  });
}

function renderPosts(posts, gridCtn) {
  
  gridCtn.innerHTML = '';
  if (posts.length === 0) {
    grid.innerHTML = '<p>No posts retrieved!.</p>';
    return;
  }

  posts.forEach(post => {
    // Formatear la fecha
    const dateObj = new Date(post.date);
    const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Construir etiquetas de categorías
    const tagsHtml = post.categories.map(cat => `<span class="tag">[${cat}]</span>`).join(' ');

    // Determinar si hay imagen
    const imgHtml = post.thumbnail 
      ? `<img src="${post.thumbnail}" alt="${post.title}" class="post-thumbnail">` 
      : '';

    // Construir la tarjeta
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.category = post.categories
    card.innerHTML = `
      ${imgHtml}
        <h3><a href="reader.html?post=${post.file}">${post.title}</a></h3>
        <p class="post-date"><time datetime="${post.date}">${dateStr}</time></p>
        <p class="post-desc">${post.description}</p>
        <div class="post-tags">${tagsHtml}</div>
    `;
    gridCtn.appendChild(card);
  
  });

}