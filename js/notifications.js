(function initUserNotifications() {
    const list = document.getElementById("userNotificationList");
    if (!list || !window.ShopSphereAdmin) {
        return;
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
                    <p>${window.ShopSphereAdmin.formatPrice(item.price)}</p>
                    <div class="d-flex gap-2">
                        <a class="btn btn-cart btn-sm" href="product.html?category=${encodeURIComponent(item.categoryKey)}&product=${encodeURIComponent(item.slug)}">Open</a>
                        <button class="btn btn-ghost btn-sm remove-wishlist-btn" data-category="${item.categoryKey}" data-slug="${item.slug}" type="button">Remove</button>
                    </div>
                </div>
            </article>
        `).join("");
    }

    function renderNotifications() {
        const items = window.ShopSphereAdmin.readAdminNotifications();
        list.innerHTML = items.length ? items.map((item) => `
            <div class="admin-list-item">
                <div class="admin-list-item__top">
                    <div>
                        <strong>${item.title}</strong>
                        <p>${item.type} • ${window.ShopSphereAdmin.formatDateTime(item.createdAt)}</p>
                    </div>
                    <span class="admin-status admin-status--approved">${item.cta}</span>
                </div>
                <p>${item.message}</p>
            </div>
        `).join("") : `<div class="admin-empty-state">No notifications yet. Fresh offers from admin will appear here.</div>`;
    }

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

    renderNotifications();
    renderWishlistPanel();
})();
