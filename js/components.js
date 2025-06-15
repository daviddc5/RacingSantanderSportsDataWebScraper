// Component Loader
class ComponentLoader {
  constructor() {
    this.components = {};
  }

  // Load a component from file
  async loadComponent(componentName, targetElement) {
    try {
      const response = await fetch(`components/${componentName}.html`);
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
    return `
      <header>
        <div class="header-container">
          <a href="index.html" class="logo-link">
            <img src="racingLogo.png" alt="Racing de Santander Crest" class="logo">
          </a>
          <nav class="main-nav">
            <ul>
              <li><a href="index.html">HOME</a></li>
              <li><a href="squad.html">SQUAD</a></li>
              <li><a href="history.html">HISTORY</a></li>
            </ul>
          </nav>
          <a href="#" class="cta-button">BUY TICKETS</a>
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
            <img src="racingLogo.png" alt="Racing de Santander Crest" class="logo-footer">
            <p>Founded in 1913. A historic club with a passionate heart. ¡Aúpa Racing!</p>
          </div>
          <div class="footer-column">
            <h4>NAVIGATION</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="squad.html">Squad</a></li>
              <li><a href="history.html">History</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>FOLLOW US</h4>
            <div class="social-icons">
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="YouTube">Youtube</a>
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
