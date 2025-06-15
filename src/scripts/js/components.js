// Component Loader for Racing Santander Website
// Dynamically loads header and footer components

class ComponentLoader {
  constructor() {
    this.components = {};
    this.loadedComponents = new Set();
  }

  // Load a component from file
  async loadComponent(componentName, targetElement) {
    if (this.loadedComponents.has(componentName)) {
      return;
    }

    try {
      const response = await fetch(`components/${componentName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load ${componentName} component`);
      }

      const html = await response.text();
      targetElement.innerHTML = html;
      this.loadedComponents.add(componentName);

      // Execute any scripts in the component
      const scripts = targetElement.querySelectorAll("script");
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.head.appendChild(newScript);
      });
    } catch (error) {
      console.error(`Error loading ${componentName} component:`, error);
      this.loadFallbackComponent(componentName, targetElement);
    }
  }

  // Load fallback component if file loading fails
  loadFallbackComponent(componentName, targetElement) {
    switch (componentName) {
      case "header":
        targetElement.innerHTML = `
                    <header>
                        <div class="header-container">
                            <a href="index.html" class="logo-link">
                                <img src="images/racingLogo.png" alt="Racing de Santander Crest" class="logo">
                            </a>
                            <nav class="main-nav">
                                <ul>
                                    <li><a href="index.html" id="nav-home">HOME</a></li>
                                    <li><a href="squad.html" id="nav-squad">SQUAD</a></li>
                                    <li><a href="history.html" id="nav-history">HISTORY</a></li>
                                </ul>
                            </nav>
                            <a href="#" class="cta-button">BUY TICKETS</a>
                            <button class="hamburger-menu" aria-label="Open navigation menu">
                                <span></span><span></span><span></span>
                            </button>
                        </div>
                    </header>
                `;
        break;

      case "footer":
        targetElement.innerHTML = `
                    <footer>
                        <div class="footer-container">
                            <div class="footer-column">
                                <img src="images/racingLogo.png" alt="Racing de Santander Crest" class="logo-footer">
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
                                    <a href="#" aria-label="Twitter">
                                        <i class="fab fa-twitter"></i>
                                        Twitter
                                    </a>
                                    <a href="#" aria-label="Instagram">
                                        <i class="fab fa-instagram"></i>
                                        Instagram
                                    </a>
                                    <a href="#" aria-label="YouTube">
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
        break;
    }
  }

  // Initialize components on page load
  async init() {
    // Load header
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (headerPlaceholder) {
      await this.loadComponent("header", headerPlaceholder);
    }

    // Load footer
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
      await this.loadComponent("footer", footerPlaceholder);
    }

    // Set active navigation
    this.setActiveNavigation();
  }

  // Set active navigation based on current page
  setActiveNavigation() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const pageNavMap = {
      "index.html": "nav-home",
      "squad.html": "nav-squad",
      "history.html": "nav-history",
    };

    const activeNavId = pageNavMap[currentPage];
    if (activeNavId) {
      const activeNav = document.getElementById(activeNavId);
      if (activeNav) {
        activeNav.classList.add("active");
      }
    }
  }
}

// Initialize component loader when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const componentLoader = new ComponentLoader();
  componentLoader.init();
});
