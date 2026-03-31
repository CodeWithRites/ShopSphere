const ADMIN_NOTIFICATIONS_KEY = "shopsphere-admin-notifications";
const ADMIN_DEFAULT_EMAIL = "admin@shopsphere.com";

function getAdminUser() {
    return window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser ? window.ShopSphereAuth.getAuthUser() : null;
}

function getConfiguredAdminEmail() {
    const configured = window.ShopSphereAdminConfig && window.ShopSphereAdminConfig.email;
    return (configured || ADMIN_DEFAULT_EMAIL).toLowerCase();
}

function ensureAdminAccess() {
    const user = getAdminUser();
    if (!user || user.role !== "admin" || (user.email || "").toLowerCase() !== getConfiguredAdminEmail()) {
        window.location.href = "index.html";
        return false;
    }
    return true;
}

function updateAdminIdentityChip() {
    const chip = document.getElementById("adminIdentityChip");
    if (!chip) {
        return;
    }
    const user = getAdminUser();
    chip.textContent = user && user.name ? `${user.name} (Admin)` : "Admin";
}

function updateAdminEmailText() {
    const emailNode = document.getElementById("adminEmailText");
    if (emailNode) {
        emailNode.textContent = getConfiguredAdminEmail();
    }
    const emailDisplay = document.getElementById("adminEmailDisplay");
    if (emailDisplay) {
        emailDisplay.textContent = getConfiguredAdminEmail();
    }
}

function readAdminNotifications() {
    try {
        return JSON.parse(localStorage.getItem(ADMIN_NOTIFICATIONS_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeAdminNotifications(items) {
    localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(items));
}

function saveAdminNotification(payload) {
    const existing = readAdminNotifications();
    existing.unshift({
        id: `notice_${Date.now()}`,
        title: payload.title || "",
        message: payload.message || "",
        type: payload.type || "Offer",
        cta: payload.cta || "Shop Now",
        createdAt: Date.now()
    });
    writeAdminNotifications(existing.slice(0, 40));
}

function deleteAdminNotification(notificationId) {
    const nextItems = readAdminNotifications().filter((item) => item.id !== notificationId);
    writeAdminNotifications(nextItems);
}

function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(Number(value || Date.now())));
}

function getStatusClass(status) {
    const normalized = String(status || "ordered").toLowerCase().replace(/\s+/g, "");
    const map = {
        ordered: "admin-status--ordered",
        approved: "admin-status--approved",
        shipped: "admin-status--shipped",
        delivered: "admin-status--delivered",
        cancelled: "admin-status--cancelled",
        instock: "admin-status--instock",
        outofstock: "admin-status--outofstock"
    };
    return map[normalized] || "admin-status--ordered";
}

function getManagedCatalog() {
    return window.ShopSphereAdminProducts ? window.ShopSphereAdminProducts.read() : {};
}

function getCatalogSnapshot() {
    return window.ShopSphereCatalog || {};
}

function saveManagedCatalog(catalog) {
    if (window.ShopSphereAdminProducts) {
        window.ShopSphereAdminProducts.write(catalog);
    }
}

function flattenCatalog(includeManagedFallback = true) {
    const catalog = includeManagedFallback ? getCatalogSnapshot() : getManagedCatalog();
    return Object.entries(catalog).flatMap(([categoryKey, items]) =>
        (Array.isArray(items) ? items : []).map((item) => ({
            ...item,
            categoryKey
        }))
    );
}

function upsertManagedProduct(categoryKey, product) {
    const managedCatalog = getManagedCatalog();
    const current = Array.isArray(managedCatalog[categoryKey]) ? managedCatalog[categoryKey] : (Array.isArray(window.ShopSphereDefaultCatalog[categoryKey]) ? [...window.ShopSphereDefaultCatalog[categoryKey]] : []);
    const next = current.filter((item) => item.slug !== product.slug);
    next.unshift(product);
    managedCatalog[categoryKey] = next;
    saveManagedCatalog(managedCatalog);
}

function updateManagedProduct(categoryKey, slug, updates) {
    const managedCatalog = getManagedCatalog();
    const fallback = Array.isArray(managedCatalog[categoryKey]) ? [...managedCatalog[categoryKey]] : (Array.isArray(window.ShopSphereCatalog[categoryKey]) ? [...window.ShopSphereCatalog[categoryKey]] : []);
    managedCatalog[categoryKey] = fallback.map((item) => item.slug === slug ? { ...item, ...updates } : item);
    saveManagedCatalog(managedCatalog);
}

async function loadAdminOrders() {
    if (window.ShopSphereOrderBook && window.ShopSphereOrderBook.loadAllOrders) {
        return await window.ShopSphereOrderBook.loadAllOrders();
    }
    return [];
}

async function updateAdminOrder(orderId, updates) {
    if (window.ShopSphereOrderBook && window.ShopSphereOrderBook.updateOrder) {
        return await window.ShopSphereOrderBook.updateOrder(orderId, updates);
    }
    return null;
}

async function loadAdminUsers() {
    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured && window.ShopSphereFirebase.listUsers) {
        return await window.ShopSphereFirebase.listUsers();
    }

    const authUser = getAdminUser();
    return authUser ? [authUser] : [];
}

function getUserActivityLog() {
    return window.ShopSphereAuth && window.ShopSphereAuth.readActivityLog ? window.ShopSphereAuth.readActivityLog() : [];
}

function calculateDashboardStats(orders, products, users) {
    const totalOrders = orders.length;
    const totalIncome = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const deliveredOrders = orders.filter((order) => String(order.status || "").toLowerCase() === "delivered").length;
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const liveUsers = users.length;
    return {
        totalOrders,
        totalIncome,
        deliveredOrders,
        totalProducts,
        totalStock,
        liveUsers
    };
}

function renderEmptyState(target, message) {
    target.innerHTML = `<div class="admin-empty-state">${message}</div>`;
}

window.ShopSphereAdmin = {
    ensureAdminAccess,
    updateAdminIdentityChip,
    updateAdminEmailText,
    readAdminNotifications,
    saveAdminNotification,
    deleteAdminNotification,
    formatPrice,
    formatDateTime,
    getStatusClass,
    flattenCatalog,
    upsertManagedProduct,
    updateManagedProduct,
    loadAdminOrders,
    updateAdminOrder,
    loadAdminUsers,
    getUserActivityLog,
    calculateDashboardStats,
    renderEmptyState,
    getConfiguredAdminEmail
};

if (document.body && document.body.hasAttribute("data-admin-page")) {
    ensureAdminAccess();
}

updateAdminIdentityChip();
updateAdminEmailText();
