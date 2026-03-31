const AUTH_STORAGE_KEY = "shopsphere-auth-user";
const USER_ACTIVITY_KEY = "shopsphere-user-activity";
const DEFAULT_ADMIN_EMAIL = "admin@shopsphere.com";

function getAdminEmail() {
    const configured = window.ShopSphereAdminConfig && window.ShopSphereAdminConfig.email;
    return (configured || DEFAULT_ADMIN_EMAIL).toLowerCase();
}

function getAuthUser() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

function setAuthUser(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function clearAuthUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function readActivityLog() {
    try {
        return JSON.parse(localStorage.getItem(USER_ACTIVITY_KEY) || "[]");
    } catch {
        return [];
    }
}

function recordActivity(entry) {
    const nextEntry = {
        type: entry.type || "login",
        name: entry.name || "",
        email: entry.email || "",
        page: entry.page || window.location.pathname,
        time: Date.now()
    };
    const history = readActivityLog();
    history.unshift(nextEntry);
    localStorage.setItem(USER_ACTIVITY_KEY, JSON.stringify(history.slice(0, 100)));
}

function ensureNotificationLinks() {
    if (document.body.hasAttribute("data-admin-page")) {
        return;
    }

    document.querySelectorAll("ul.navbar-nav").forEach((navList) => {
        if (navList.classList.contains("admin-links") || navList.querySelector(".user-notification-link")) {
            return;
        }

        const notificationItem = document.createElement("li");
        notificationItem.className = "nav-item user-notification-link";

        const notificationLink = document.createElement("a");
        notificationLink.className = "nav-link cart-link";
        notificationLink.href = "notifications.html";
        notificationLink.innerHTML = '<i class="fa-regular fa-bell me-1"></i>Notifications';

        if (window.location.pathname.toLowerCase().endsWith("/notifications.html") || window.location.pathname.toLowerCase().endsWith("notifications.html")) {
            notificationLink.classList.add("active");
        }

        notificationItem.appendChild(notificationLink);

        const wishlistItem = Array.from(navList.children).find((item) => item.querySelector('[data-bs-target="#wishlistCanvas"]'));
        if (wishlistItem) {
            navList.insertBefore(notificationItem, wishlistItem);
        } else {
            navList.appendChild(notificationItem);
        }
    });
}

function syncAuthUI() {
    const user = getAuthUser();
    ensureNotificationLinks();

    document.querySelectorAll(".auth-login-link").forEach((node) => {
        node.classList.toggle("d-none", Boolean(user));
    });

    document.querySelectorAll(".auth-profile-menu").forEach((node) => {
        node.classList.toggle("d-none", !user);
    });

    if (window.ShopSphereStoreUI && window.ShopSphereStoreUI.syncStoreBadges) {
        window.ShopSphereStoreUI.syncStoreBadges();
    }
}

document.addEventListener("click", (event) => {
    const logoutButton = event.target.closest(".auth-logout-btn");
    if (!logoutButton) {
        return;
    }

    const completeLogout = () => {
        clearAuthUser();
        window.location.href = "index.html";
    };

    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        window.ShopSphereFirebase.signOut()
            .catch(() => null)
            .finally(completeLogout);
        return;
    }

    completeLogout();
});

window.ShopSphereAuth = {
    getAuthUser,
    setAuthUser,
    clearAuthUser,
    syncAuthUI,
    readActivityLog,
    recordActivity
};

syncAuthUI();

if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured && window.ShopSphereFirebase.onAuthStateChanged) {
    window.ShopSphereFirebase.onAuthStateChanged((user) => {
        if (user) {
            const adminEmail = getAdminEmail();
            setAuthUser({
                name: user.displayName || (user.email ? user.email.split("@")[0] : "Profile"),
                email: user.email || "",
                role: user.email && user.email.toLowerCase() === adminEmail ? "admin" : "user"
            });
        } else {
            clearAuthUser();
        }
        syncAuthUI();
    });
}
