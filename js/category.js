function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function getActiveCategory() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "mens";
}

function getCategoryMeta(categoryKey) {
    return (window.ShopSphereCategoryConfig && window.ShopSphereCategoryConfig[categoryKey]) || {
        title: "ShopSphere Collection",
        description: "Fresh picks curated for your style."
    };
}

function renderCategoryPage() {
    const activeKey = getActiveCategory();
    const activeCategory = getCategoryMeta(activeKey);
    const products = window.ShopSphereCatalog[activeKey] || [];

    document.getElementById("categoryTitle").textContent = activeCategory.title;
    document.getElementById("categoryDescription").textContent = activeCategory.description;
    document.getElementById("gridTitle").textContent = `${activeCategory.title} Picks`;
    document.getElementById("gridSubtitle").textContent = "Hand-picked styles from the selected category.";

    const host = document.getElementById("categoryProducts");
    if (!products.length) {
        host.innerHTML = `<div class="col-12"><div class="simple-panel text-center py-5"><h3>No products added yet</h3><p class="mb-0">Admin-added products for this category will appear here.</p></div></div>`;
        return;
    }

    host.innerHTML = products.map((product) => `
        <div class="col-lg-3 col-md-6">
            <article class="product-card">
                <div class="product-media">
                    <span class="sale-chip">${product.badge}</span>
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="product-body">
                    <span class="product-tag">${activeCategory.title}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="rating-row">
                        <span><i class="fa-solid fa-star text-warning me-1"></i>(${product.reviews})</span>
                        <span class="rating-chip"><i class="fa-solid fa-star me-1"></i>${product.rating}</span>
                    </div>
                    <div class="price-line">
                        <span class="price-current">${formatCurrency(product.price)}</span>
                        <span class="price-old">${formatCurrency(product.oldPrice)}</span>
                    </div>
                    <div class="save-line">You save ${formatCurrency(Math.max(0, product.oldPrice - product.price))}</div>
                    <a href="product.html?category=${encodeURIComponent(activeKey)}&product=${encodeURIComponent(product.slug)}" class="btn btn-cart w-100">Shop This</a>
                </div>
            </article>
        </div>
    `).join("");
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

function setupWishlistPanel() {
    document.addEventListener("click", (event) => {
        const openTrigger = event.target.closest('[data-bs-target="#wishlistCanvas"]');
        const removeButton = event.target.closest(".remove-wishlist-btn");

        if (openTrigger) {
            renderWishlistPanel();
            return;
        }

        if (!removeButton) {
            return;
        }

        window.ShopSphereStore.removeWishlist(removeButton.dataset.slug, removeButton.dataset.category);
        renderWishlistPanel();
        if (window.ShopSphereStoreUI) {
            window.ShopSphereStoreUI.syncStoreBadges();
        }
    });
}

renderCategoryPage();
renderWishlistPanel();
setupWishlistPanel();
