// Component Loader
class ComponentLoader {
  constructor() {
    this.components = {};
    this.basePath = this.getBasePath();
  }

  // Detect the base path for components based on current page location
  getBasePath() {
    // For Vercel, we'll use absolute paths from root
    return "/";
  }

  // Load a component from file
  async loadComponent(componentName, targetElement) {
    try {
      const componentPath = `${this.basePath}components/${componentName}.html`;
      console.log(`Attempting to load component: ${componentPath}`);

      const response = await fetch(componentPath);
      console.log(`Response status: ${response.status} for ${componentPath}`);

      if (!response.ok) {
        throw new Error(
          `Failed to load ${componentName} component: ${response.status}`
        );
      }

      const html = await response.text();
      console.log(
        `Successfully loaded ${componentName} component, length: ${html.length}`
      );

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
      console.log(`Using fallback content for ${componentName}`);

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
    return `
      <header>
        <div class="header-container">
          <a href="/" class="logo-link">
            <img src="/images/racingLogo.png" alt="Racing de Santander Crest" class="logo">
          </a>
          <nav class="main-nav">
            <ul>
              <li><a href="/">HOME</a></li>
              <li><a href="/squad">SQUAD</a></li>
              <li><a href="/history">HISTORY</a></li>
            </ul>
          </nav>
          <a href="https://entradas.realracingclub.es/" target="_blank" rel="noopener noreferrer" class="cta-button">BUY TICKETS</a>
        </div>
      </header>
    `;
  }

  // Fallback footer content
  getFooterFallback() {
    return `
      <footer>
        <div class="footer-container">
          <div class="footer-column">
            <img src="/images/racingLogo.png" alt="Racing de Santander Crest" class="logo-footer">
            <p>Founded in 1913. A historic club with a passionate heart. ¡Aúpa Racing!</p>
          </div>
          <div class="footer-column">
            <h4>NAVIGATION</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/squad">Squad</a></li>
              <li><a href="/history">History</a></li>
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
