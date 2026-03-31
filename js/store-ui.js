function getStoredArray(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        return [];
    }
}

function syncStoreBadges() {
    const isLoggedIn = Boolean(window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser && window.ShopSphereAuth.getAuthUser());

    if (!isLoggedIn) {
        document.querySelectorAll(".wishlist-count, .cart-count").forEach((node) => {
            node.textContent = "0";
            node.classList.add("d-none");
        });
        return;
    }

    const wishlistCount = getStoredArray("shopsphere-wishlist").length;
    const cartCount = getStoredArray("shopsphere-cart").reduce((sum, item) => sum + (item.qty || 1), 0);

    document.querySelectorAll(".wishlist-count").forEach((node) => {
        node.textContent = wishlistCount;
        node.classList.toggle("d-none", wishlistCount === 0);
    });

    document.querySelectorAll(".cart-count").forEach((node) => {
        node.textContent = cartCount;
        node.classList.toggle("d-none", cartCount === 0);
    });
}

window.ShopSphereStoreUI = {
    syncStoreBadges
};

syncStoreBadges();
