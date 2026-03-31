function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function formatOrderDate(timestamp) {
    const value = Number(timestamp || Date.now());
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
    });
}

function renderWishlistPanel() {
    const host = document.getElementById("wishlistContent");
    if (!host || !window.ShopSphereStore) {
        return;
    }

    const wishlist = window.ShopSphereStore.read(window.ShopSphereStore.wishlistKey);
    if (!wishlist.length) {
        host.innerHTML = `<div class="wishlist-empty">No items in wishlist yet.</div>`;
        return;
    }

    host.innerHTML = wishlist.map((item) => `
        <article class="wishlist-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h6>${item.name}</h6>
                <p>${formatCurrency(item.price)}</p>
                <div class="d-flex gap-2">
                    <a class="btn btn-cart btn-sm" href="product.html?category=${encodeURIComponent(item.categoryKey)}&product=${encodeURIComponent(item.slug)}">Open</a>
                    <button class="btn btn-ghost btn-sm remove-wishlist-btn" data-category="${item.categoryKey}" data-slug="${item.slug}" type="button">Remove</button>
                </div>
            </div>
        </article>
    `).join("");
}

function buildOrderCard(order) {
    const item = order.items && order.items[0] ? order.items[0] : null;
    const image = item ? item.image : "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80";
    const title = item ? item.name : "Order Item";
    const subtitle = item ? `Size: ${item.size || "M"}${item.qty ? ` | Qty: ${item.qty}` : ""}` : "Product details unavailable";
    const statusDate = formatOrderDate(order.createdAt);

    return `
        <article class="order-row-card" data-order-id="${order.id}">
            <img class="order-row-card__image" src="${image}" alt="${title}">
            <div>
                <h3 class="order-row-card__title">${title}</h3>
                <p class="order-row-card__meta">${subtitle}</p>
                <p class="order-row-card__desc">Order ID: ${order.id} | ${order.paymentMethod}</p>
            </div>
            <div class="order-row-card__price">${formatCurrency(order.total)}</div>
            <div class="order-row-card__status">
                <div class="order-row-card__status-top">
                    <span class="status-dot"></span>
                    <span>${order.status} on ${statusDate}</span>
                </div>
                <p class="mb-0">Your item has been ${order.status.toLowerCase()}.</p>
                <div class="order-row-card__action"><i class="fa-solid fa-star me-2"></i>Open order details</div>
            </div>
        </article>
    `;
}

function renderOrdersList(orders) {
    const host = document.getElementById("ordersList");
    if (!orders.length) {
        host.innerHTML = `<div class="orders-empty-card">No orders found. Start shopping to see your orders here.</div>`;
        return;
    }

    host.innerHTML = orders.map(buildOrderCard).join("");
}

async function filterAndRenderOrders() {
    const input = document.getElementById("ordersSearchInput");
    const query = input.value.trim().toLowerCase();
    const orders = await window.ShopSphereOrderBook.loadOrders();
    const filtered = orders.filter((order) => {
        const itemNames = (order.items || []).map((item) => item.name).join(" ").toLowerCase();
        return !query || order.id.toLowerCase().includes(query) || itemNames.includes(query) || (order.paymentMethod || "").toLowerCase().includes(query);
    });
    renderOrdersList(filtered);
}

function setupOrdersInteractions() {
    document.getElementById("ordersSearchInput").addEventListener("input", () => {
        filterAndRenderOrders();
    });

    document.getElementById("ordersSearchButton").addEventListener("click", () => {
        filterAndRenderOrders();
    });

    document.addEventListener("click", (event) => {
        const orderCard = event.target.closest(".order-row-card");
        const openWishlist = event.target.closest('[data-bs-target="#wishlistCanvas"]');
        const removeWishlist = event.target.closest(".remove-wishlist-btn");

        if (openWishlist) {
            renderWishlistPanel();
            return;
        }

        if (removeWishlist) {
            window.ShopSphereStore.removeWishlist(removeWishlist.dataset.slug, removeWishlist.dataset.category);
            renderWishlistPanel();
            if (window.ShopSphereStoreUI) {
                window.ShopSphereStoreUI.syncStoreBadges();
            }
            return;
        }

        if (orderCard) {
            window.location.href = `order-details.html?order=${encodeURIComponent(orderCard.dataset.orderId)}`;
        }
    });
}

async function initOrdersPage() {
    renderWishlistPanel();
    await filterAndRenderOrders();
    setupOrdersInteractions();
}

initOrdersPage();
