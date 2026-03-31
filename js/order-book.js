const ORDER_CACHE_KEY = "shopsphere-orders";
const ADMIN_ORDER_CACHE_KEY = "shopsphere-admin-orders";

function buildTimelineStep(status, paymentMethod, time = Date.now()) {
    const normalized = String(status || "Ordered").toLowerCase();
    const map = {
        ordered: {
            title: "Order Confirmed",
            text: "Your order was placed successfully."
        },
        approved: {
            title: "Approved",
            text: "Admin approved your order and started processing it."
        },
        shipped: {
            title: "Shipped",
            text: "Your order has been shipped and is on the way."
        },
        delivered: {
            title: "Delivered",
            text: "Your order has been delivered successfully."
        },
        cancelled: {
            title: "Cancelled",
            text: "This order was cancelled by admin."
        }
    };

    const selected = map[normalized] || {
        title: status || "Order Update",
        text: paymentMethod ? `Payment method: ${paymentMethod}` : "Your order update is available here."
    };

    return {
        status: status || "Ordered",
        title: selected.title,
        text: selected.text,
        time
    };
}

function appendTimeline(order, updates) {
    const currentTimeline = Array.isArray(order.timeline) ? [...order.timeline] : [buildTimelineStep(order.status || "Ordered", order.paymentMethod, order.createdAt || Date.now())];
    if (!updates.status || updates.status === order.status) {
        return currentTimeline;
    }

    currentTimeline.push(buildTimelineStep(updates.status, order.paymentMethod, Date.now()));
    return currentTimeline;
}

function readOrderCache() {
    try {
        return JSON.parse(localStorage.getItem(ORDER_CACHE_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeOrderCache(orders) {
    localStorage.setItem(ORDER_CACHE_KEY, JSON.stringify(orders));
}

function getAuthEmail() {
    const authUser = window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser ? window.ShopSphereAuth.getAuthUser() : null;
    return authUser && authUser.email ? authUser.email.toLowerCase() : "";
}

function filterOrdersForEmail(orders, email) {
    if (!email) {
        return [];
    }
    return orders.filter((order) => String(order.userEmail || "").toLowerCase() === email);
}

async function getOrderUserId() {
    if (window.ShopSphereFirebase && window.ShopSphereFirebase.getCurrentUser) {
        const user = window.ShopSphereFirebase.getCurrentUser();
        return user ? user.uid : "";
    }
    return "";
}

async function loadOrders() {
    const uid = await getOrderUserId();
    if (uid && window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        const orders = await window.ShopSphereFirebase.getOrders(uid);
        writeOrderCache(orders);
        return orders;
    }

    const cachedOrders = readOrderCache();
    if (cachedOrders.length) {
        return cachedOrders;
    }

    const email = getAuthEmail();
    const adminOrders = readAdminOrderCache();
    const emailOrders = filterOrdersForEmail(adminOrders, email);
    if (emailOrders.length) {
        writeOrderCache(emailOrders);
        return emailOrders;
    }

    return [];
}

async function saveOrder(order) {
    const uid = await getOrderUserId();
    let savedOrder;

    if (uid && window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        savedOrder = await window.ShopSphereFirebase.saveOrder(uid, order);
        const orders = await window.ShopSphereFirebase.getOrders(uid);
        writeOrderCache(orders);
        const adminOrders = readAdminOrderCache();
        const filteredAdminOrders = adminOrders.filter((item) => item.id !== savedOrder.id);
        filteredAdminOrders.unshift(savedOrder);
        writeAdminOrderCache(filteredAdminOrders);
        return savedOrder;
    }

    const orders = readOrderCache();
    savedOrder = {
        ...order,
        id: order.id || `order_${Date.now()}`
    };
    orders.unshift(savedOrder);
    writeOrderCache(orders);
    const adminOrders = readAdminOrderCache();
    adminOrders.unshift(savedOrder);
    writeAdminOrderCache(adminOrders);
    return savedOrder;
}

function readAdminOrderCache() {
    try {
        return JSON.parse(localStorage.getItem(ADMIN_ORDER_CACHE_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeAdminOrderCache(orders) {
    localStorage.setItem(ADMIN_ORDER_CACHE_KEY, JSON.stringify(orders));
}

async function loadAllOrders() {
    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured && window.ShopSphereFirebase.getAllOrders) {
        const orders = await window.ShopSphereFirebase.getAllOrders();
        writeAdminOrderCache(orders);
        return orders;
    }
    return readAdminOrderCache();
}

async function updateOrder(orderId, updates) {
    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured && window.ShopSphereFirebase.updateOrder) {
        const currentOrders = await loadAllOrders();
        const currentOrder = currentOrders.find((item) => item.id === orderId);
        const nextUpdates = currentOrder ? { ...updates, timeline: appendTimeline(currentOrder, updates) } : updates;
        const order = await window.ShopSphereFirebase.updateOrder(orderId, nextUpdates);
        const orders = await window.ShopSphereFirebase.getAllOrders();
        writeAdminOrderCache(orders);
        const currentUserId = await getOrderUserId();
        if (currentUserId && window.ShopSphereFirebase.getOrders) {
            const userOrders = await window.ShopSphereFirebase.getOrders(currentUserId);
            writeOrderCache(userOrders);
        } else {
            const email = getAuthEmail();
            const emailOrders = filterOrdersForEmail(orders, email);
            if (emailOrders.length) {
                writeOrderCache(emailOrders);
            }
        }
        return order;
    }

    const orders = readAdminOrderCache();
    const nextOrders = orders.map((order) => order.id === orderId ? { ...order, ...updates, timeline: appendTimeline(order, updates) } : order);
    writeAdminOrderCache(nextOrders);

    const currentUserOrders = readOrderCache();
    const nextUserOrders = currentUserOrders.map((order) => order.id === orderId ? { ...order, ...updates, timeline: appendTimeline(order, updates) } : order);
    writeOrderCache(nextUserOrders);

    return nextOrders.find((item) => item.id === orderId) || nextUserOrders.find((item) => item.id === orderId) || null;
}

window.ShopSphereOrderBook = {
    loadOrders,
    saveOrder,
    loadAllOrders,
    updateOrder,
    async getOrderById(orderId) {
        const orders = await loadAllOrders();
        return orders.find((item) => item.id === orderId) || null;
    }
};
