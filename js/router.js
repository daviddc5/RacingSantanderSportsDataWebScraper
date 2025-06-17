// Simple client-side router for Vercel deployment
class Router {
  constructor() {
    this.routes = {
      "/": "/index.html",
      "/squad": "/squad.html",
      "/history": "/history.html",
    };

    this.init();
  }

  init() {
    // Handle navigation clicks
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="/"]')) {
        e.preventDefault();
        const href = e.target.getAttribute("href");
        this.navigate(href);
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      this.loadPage(window.location.pathname);
    });

    // Load initial page
    this.loadPage(window.location.pathname);
  }

  async navigate(path) {
    // Update browser history
    window.history.pushState({}, "", path);

    // Load the page content
    await this.loadPage(path);
  }

  async loadPage(path) {
    const route = this.routes[path] || this.routes["/"];

    try {
      const response = await fetch(route);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      // Extract the main content from the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const mainContent = doc.querySelector("main");

      if (mainContent) {
        // Replace the current main content
        const currentMain = document.querySelector("main");
        if (currentMain) {
          currentMain.innerHTML = mainContent.innerHTML;
        }

        // Update page title
        const title = doc.querySelector("title");
        if (title) {
          document.title = title.textContent;
        }

        // Update active navigation
        this.updateActiveNavigation(path);

        // Re-initialize any page-specific scripts
        this.initializePageScripts(path);
      }
    } catch (error) {
      console.error("Error loading page:", error);
      // Fallback to full page reload
      window.location.href = route;
    }
  }

  updateActiveNavigation(path) {
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll(".main-nav a");
    navLinks.forEach((link) => link.classList.remove("active"));

    // Add active class to current page
    const currentLink = document.querySelector(`[href="${path}"]`);
    if (currentLink) {
      currentLink.classList.add("active");
    }
  }

  initializePageScripts(path) {
    // Initialize page-specific functionality
    switch (path) {
      case "/":
        if (typeof racingAPI !== "undefined") {
          loadMatchData();
        }
        break;
      case "/squad":
        if (typeof racingAPI !== "undefined") {
          loadSquadData();
        }
        break;
      case "/history":
        // History page doesn't need special initialization
        break;
    }
  }
}

// Initialize router when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  new Router();
});
