const AUTH_REDIRECT_KEY = "shopsphere-auth-redirect";

function isLoggedIn() {
    return Boolean(window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser && window.ShopSphereAuth.getAuthUser());
}

function isAdminUser() {
    const user = window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser ? window.ShopSphereAuth.getAuthUser() : null;
    return Boolean(user && user.role === "admin");
}

function isAllowedPublicTarget(target) {
    if (!target) {
        return true;
    }

    if (target.matches('[data-bs-target="#wishlistCanvas"]') || target.closest('[data-bs-target="#wishlistCanvas"]')) {
        return false;
    }

    if (target.closest("[data-public-access]")) {
        return true;
    }

    if (target.matches(".btn-close, .navbar-toggler, .dropdown-toggle")) {
        return true;
    }

    if (target.closest(".btn-close, .navbar-toggler")) {
        return true;
    }

    if (target.closest("form")) {
        return true;
    }

    const link = target.closest("a");
    if (!link) {
        return false;
    }

    const href = link.getAttribute("href") || "";
    return href.includes("login.html") || href.includes("register.html") || href.includes("forgot-password.html") || href.startsWith("#");
}

function redirectToLogin() {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, `${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.location.href = "login.html";
}

function setupAuthGuard() {
    const body = document.body;
    if (!body) {
        return;
    }

    if (body.hasAttribute("data-protected-page") && !isLoggedIn()) {
        redirectToLogin();
        return;
    }

    if (body.hasAttribute("data-admin-page") && !isAdminUser()) {
        window.location.href = "index.html";
        return;
    }

    document.addEventListener("click", (event) => {
        if (isLoggedIn()) {
            return;
        }

        const actionable = event.target.closest("button, a.btn, a.nav-link, a.section-link, a.category-link, a.cart-link");
        if (!actionable) {
            return;
        }

        if (isAllowedPublicTarget(actionable)) {
            return;
        }

        event.preventDefault();
        redirectToLogin();
    });
}

window.ShopSphereAuthGuard = {
    redirectKey: AUTH_REDIRECT_KEY,
    redirectToLogin,
    setupAuthGuard
};

setupAuthGuard();
