// Centralized Router for Racing de Santander Website
class Router {
  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.routes = {
      home: "/",
      squad: "/pages/squad.html",
      history: "/pages/history.html",
    };
  }

  // Get the base URL for the current environment
  getBaseUrl() {
    // Check if we're on GitHub Pages (custom domain or username.github.io)
    if (
      window.location.hostname.includes("github.io") ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("netlify.app")
    ) {
      return "";
    }

    // For local development or other hosting
    return "";
  }

  // Navigate to a specific route
  navigate(route) {
    const path = this.routes[route] || this.routes.home;
    window.location.href = this.baseUrl + path;
  }

  // Get the current route
  getCurrentRoute() {
    const path = window.location.pathname;

    if (path === "/" || path === "/index.html") {
      return "home";
    } else if (path.includes("squad")) {
      return "squad";
    } else if (path.includes("history")) {
      return "history";
    }

    return "home";
  }

  // Get the correct path for a route
  getPath(route) {
    return this.baseUrl + (this.routes[route] || this.routes.home);
  }

  // Get the correct image path
  getImagePath(imageName) {
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes("/pages/");

    if (isInPagesFolder) {
      return "../images/" + imageName;
    }
    return "./images/" + imageName;
  }

  // Initialize router
  init() {
    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      this.handleRouteChange();
    });

    // Handle initial route
    this.handleRouteChange();
  }

  // Handle route changes
  handleRouteChange() {
    const currentRoute = this.getCurrentRoute();
    console.log("Current route:", currentRoute);

    // Update active navigation
    this.updateActiveNavigation(currentRoute);
  }

  // Update active navigation state
  updateActiveNavigation(activeRoute) {
    const navLinks = document.querySelectorAll(".main-nav a");
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    const activeNavMap = {
      home: "nav-home",
      squad: "nav-squad",
      history: "nav-history",
    };

    const activeNavId = activeNavMap[activeRoute];
    if (activeNavId) {
      const activeNav = document.getElementById(activeNavId);
      if (activeNav) {
        activeNav.classList.add("active");
      }
    }
  }
}

// Global router instance
window.racingRouter = new Router();

// Initialize router when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  if (window.racingRouter) {
    window.racingRouter.init();
  }
});
