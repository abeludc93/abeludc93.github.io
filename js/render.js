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