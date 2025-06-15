// Component Loader
class ComponentLoader {
  constructor() {
    this.components = {};
    this.basePath = this.getBasePath();
  }

  // Detect the base path for components based on current page location
  getBasePath() {
    const currentPath = window.location.pathname;
    // If we're in the pages folder, go up one level
    if (currentPath.includes("/pages/")) {
      return "../";
    }
    return "./";
  }

  // Load a component from file
  async loadComponent(componentName, targetElement) {
    try {
      const response = await fetch(
        `${this.basePath}components/${componentName}.html`
      );
      if (!response.ok) {
        throw new Error(`Failed to load ${componentName} component`);
      }

      const html = await response.text();
      targetElement.innerHTML = html;

      // Execute any scripts in the component
      const scripts = targetElement.querySelectorAll("script");
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.head.appendChild(newScript);
      });

      console.log(`${componentName} component loaded successfully`);
    } catch (error) {
      console.error(`Error loading ${componentName} component:`, error);
      // Fallback content
      if (componentName === "header") {
        targetElement.innerHTML = this.getHeaderFallback();
      } else if (componentName === "footer") {
        targetElement.innerHTML = this.getFooterFallback();
      }
    }
  }

  // Load header component
  async loadHeader() {
    const headerElement = document.getElementById("header-placeholder");
    if (headerElement) {
      await this.loadComponent("header", headerElement);
    }
  }

  // Load footer component
  async loadFooter() {
    const footerElement = document.getElementById("footer-placeholder");
    if (footerElement) {
      await this.loadComponent("footer", footerElement);
    }
  }

  // Load all components
  async loadAllComponents() {
    await Promise.all([this.loadHeader(), this.loadFooter()]);
  }

  // Fallback header content
  getHeaderFallback() {
    const homePath = this.basePath === "../" ? "../index.html" : "index.html";
    const squadPath =
      this.basePath === "../" ? "squad.html" : "pages/squad.html";
    const historyPath =
      this.basePath === "../" ? "history.html" : "pages/history.html";
    const imagePath =
      this.basePath === "../"
        ? "../images/racingLogo.png"
        : "images/racingLogo.png";

    return `
      <header>
        <div class="header-container">
          <a href="${homePath}" class="logo-link">
            <img src="${imagePath}" alt="Racing de Santander Crest" class="logo">
          </a>
          <nav class="main-nav">
            <ul>
              <li><a href="${homePath}">HOME</a></li>
              <li><a href="${squadPath}">SQUAD</a></li>
              <li><a href="${historyPath}">HISTORY</a></li>
            </ul>
          </nav>
          <a href="#" class="cta-button">BUY TICKETS</a>
        </div>
      </header>
    `;
  }

  // Fallback footer content
  getFooterFallback() {
    const homePath = this.basePath === "../" ? "../index.html" : "index.html";
    const squadPath =
      this.basePath === "../" ? "squad.html" : "pages/squad.html";
    const historyPath =
      this.basePath === "../" ? "history.html" : "pages/history.html";
    const imagePath =
      this.basePath === "../"
        ? "../images/racingLogo.png"
        : "images/racingLogo.png";

    return `
      <footer>
        <div class="footer-container">
          <div class="footer-column">
            <img src="${imagePath}" alt="Racing de Santander Crest" class="logo-footer">
            <p>Founded in 1913. A historic club with a passionate heart. ¡Aúpa Racing!</p>
          </div>
          <div class="footer-column">
            <h4>NAVIGATION</h4>
            <ul>
              <li><a href="${homePath}">Home</a></li>
              <li><a href="${squadPath}">Squad</a></li>
              <li><a href="${historyPath}">History</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>FOLLOW US</h4>
            <div class="social-icons">
              <a href="https://x.com/realracingclub" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i class="fab fa-twitter"></i>
                Twitter
              </a>
              <a href="https://www.instagram.com/realracingclub/?hl=es" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
                Instagram
              </a>
              <a href="https://www.youtube.com/realracingclubsantandersad" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i class="fab fa-youtube"></i>
                YouTube
              </a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 David Diaz Clifton Racing Fan Page</p>
        </div>
      </footer>
    `;
  }
}

// Initialize component loader
const componentLoader = new ComponentLoader();

// Load components when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  componentLoader.loadAllComponents();
});
