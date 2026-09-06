function filterPosts(category) {
  const posts = document.querySelectorAll('.post-card');
  
  posts.forEach(post => {
    if (category === 'all' || post.dataset.category === category) {
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

//-----------------------------------

function initCatalog(){


document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById('posts-grid');
  const filterSelect = document.getElementById('category-filter');
  
  let allPosts = []; // Guardamos los posts en memoria

  // 1. Obtener el archivo maestro
  fetch('posts.json')
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar el JSON de posts.");
      return response.json();
    })
    .then(data => {
      // Ordenar los posts por fecha (del más reciente al más antiguo)
      allPosts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      populateFilters(allPosts);
      renderPosts(allPosts);
    })
    .catch(err => {
      grid.innerHTML = `<p>Error loading catalog: ${err.message}</p>`;
    });

  // 2. Extraer categorías únicas y llenar el `<select>`
  function populateFilters(posts) {
    const categoriesSet = new Set();
    
    posts.forEach(post => {
      post.categories.forEach(cat => categoriesSet.add(cat));
    });

    // Ordenar alfabéticamente las categorías
    const sortedCategories = Array.from(categoriesSet).sort();

    sortedCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      filterSelect.appendChild(option);
    });
  }

  // 3. Pintar las tarjetas en el HTML
  function renderPosts(posts) {
    grid.innerHTML = ''; // Limpiar grid

    if (posts.length === 0) {
      grid.innerHTML = '<p>No posts found for this category.</p>';
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
      card.innerHTML = `
        ${imgHtml}
        <div class="post-card-content">
          <h3><a href="lector.html?post=${post.file}">${post.title}</a></h3>
          <p class="post-date"><time datetime="${post.date}">${dateStr}</time></p>
          <p class="post-desc">${post.description}</p>
          <div class="post-tags">${tagsHtml}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // 4. Lógica de filtrado al cambiar el desplegable
  filterSelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    
    if (selectedCategory === 'all') {
      renderPosts(allPosts);
    } else {
      const filtered = allPosts.filter(post => post.categories.includes(selectedCategory));
      renderPosts(filtered);
    }
  });
});

}