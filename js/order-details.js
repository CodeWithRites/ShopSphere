function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function formatDetailDate(timestamp) {
    const value = Number(timestamp || Date.now());
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
    });
}

function getOrderIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("order") || "";
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

function buildTimeline(order) {
    const timeline = Array.isArray(order.timeline) && order.timeline.length
        ? order.timeline
        : [{
            status: order.status || "Ordered",
            title: "Order Confirmed",
            text: "Your order was placed successfully.",
            time: order.createdAt || Date.now()
        }];

    return timeline.map((step) => ({
        title: `${step.title}, ${formatDetailDate(step.time)}`,
        text: step.text || "Your order update is available here."
    }));
}

function renderOrderDetail(order) {
    const item = order.items && order.items[0] ? order.items[0] : null;
    if (!item) {
        return;
    }

    document.getElementById("detailOrderId").textContent = order.id;
    document.title = `${order.id} - ShopSphere`;

    document.getElementById("orderDetailHero").innerHTML = `
        <div class="order-detail-hero">
            <div>
                <h2>${item.name}</h2>
                <p class="order-detail-hero__meta">Size: ${item.size || "M"}${item.qty ? ` | Qty: ${item.qty}` : ""}</p>
                <p class="order-detail-hero__meta">Order ID: ${order.id}</p>
                <div class="order-price-highlight">${formatCurrency(order.total)}</div>
            </div>
            <img class="order-detail-hero__img" src="${item.image}" alt="${item.name}">
        </div>
    `;

    document.getElementById("orderTimeline").innerHTML = buildTimeline(order).map((step) => `
        <div class="timeline-item">
            <span class="timeline-item__icon"><i class="fa-solid fa-check"></i></span>
            <div>
                <strong>${step.title}</strong>
                <p class="mb-0">${step.text}</p>
            </div>
        </div>
    `).join("");

    const address = order.address || {};
    document.getElementById("orderDeliveryDetails").innerHTML = `
        <div class="delivery-info">
            <div class="delivery-info__box">
                <div class="delivery-info__row">
                    <i class="fa-solid fa-house"></i>
                    <div>
                        <strong>${address.type || "Home"}</strong><br>
                        <span>${address.line1 || "Address unavailable"}${address.line2 ? `, ${address.line2}` : ""}, ${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}</span>
                    </div>
                </div>
            </div>
            <div class="delivery-info__box">
                <div class="delivery-info__row">
                    <i class="fa-regular fa-user"></i>
                    <div>
                        <strong>${address.fullName || "ShopSphere Customer"}</strong><br>
                        <span>${address.phone || "Phone unavailable"}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const itemTotal = (order.items || []).reduce((sum, entry) => sum + ((entry.oldPrice || entry.price || 0) * (entry.qty || 1)), 0);
    const discount = Math.max(itemTotal - order.total, 0);
    document.getElementById("orderPriceDetails").innerHTML = `
        <div class="price-breakup__row"><span>Listing price</span><strong>${formatCurrency(itemTotal || order.total)}</strong></div>
        <div class="price-breakup__row"><span>Special price</span><strong>${formatCurrency(order.total + discount)}</strong></div>
        <div class="price-breakup__row"><span>Other discount</span><strong class="text-success">-${formatCurrency(discount)}</strong></div>
        <div class="price-breakup__row total"><span>Total amount</span><strong>${formatCurrency(order.total)}</strong></div>
        <div class="price-breakup__row"><span>Payment method</span><strong>${order.paymentMethod}</strong></div>
        <button class="btn btn-ghost invoice-btn" type="button"><i class="fa-regular fa-file-lines me-2"></i>Download Invoice</button>
    `;
}

function renderNotFound() {
    document.getElementById("orderDetailHero").innerHTML = `
        <div class="orders-empty-card w-100">
            <h3>Order not found</h3>
            <p class="mb-0">We could not find the order you are looking for.</p>
        </div>
    `;
    document.getElementById("orderTimeline").innerHTML = "";
    document.getElementById("orderDeliveryDetails").innerHTML = "";
    document.getElementById("orderPriceDetails").innerHTML = "";
}

function setupDetailInteractions() {
    document.addEventListener("click", (event) => {
        const openWishlist = event.target.closest('[data-bs-target="#wishlistCanvas"]');
        const removeWishlist = event.target.closest(".remove-wishlist-btn");

        if (openWishlist) {
            renderWishlistPanel();
            return;
        }

        if (!removeWishlist) {
            return;
        }

        window.ShopSphereStore.removeWishlist(removeWishlist.dataset.slug, removeWishlist.dataset.category);
        renderWishlistPanel();
        if (window.ShopSphereStoreUI) {
            window.ShopSphereStoreUI.syncStoreBadges();
        }
    });
}

async function initOrderDetailPage() {
    renderWishlistPanel();
    setupDetailInteractions();

    const orderId = getOrderIdFromQuery();
    if (!orderId || !window.ShopSphereOrderBook) {
        renderNotFound();
        return;
    }

    const order = await window.ShopSphereOrderBook.getOrderById(orderId);
    if (!order) {
        renderNotFound();
        return;
    }

    renderOrderDetail(order);
}

initOrderDetailPage();
