const features = [
    { icon: "fa-truck-fast", title: "Free Shipping", text: "On orders above Rs. 499" },
    { icon: "fa-rotate-left", title: "Easy Returns", text: "30-day return policy" },
    { icon: "fa-shield-heart", title: "Secure Payment", text: "100% secure checkout" },
    { icon: "fa-headset", title: "24/7 Support", text: "Dedicated support" }
];

const standardCategories = [
    { key: "mens", name: "Mens", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80" },
    { key: "womens", name: "Womens", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80" },
    { key: "boys", name: "Boys", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&q=80" },
    { key: "girls", name: "Girls", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80" },
    { key: "kids", name: "Kids", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80" },
    { key: "home-appliances", name: "Home Appliances", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=300&q=80" },
    { key: "electronics", name: "Electronics", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80" },
    { key: "food", name: "Food", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" },
    { key: "beauty", name: "Beauty", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80" }
];

const banners = [
    { key: "flat-50-off", badge: "Sale", title: "Flat 50% Off", text: "On premium brands", button: "Shop Now", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" },
    { key: "summer-collection", badge: "New", title: "Summer Collection", text: "Refresh your wardrobe", button: "Explore Now", className: "banner-warm", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80" }
];

const testimonials = [
    { name: "Rajesh Kumar", image: "https://randomuser.me/api/portraits/men/32.jpg", quote: "Amazing quality products and fast delivery. Highly recommended!", verified: "Verified Buyer" },
    { name: "Priya Sharma", image: "https://randomuser.me/api/portraits/women/44.jpg", quote: "Great shopping experience! The products exceeded my expectations.", verified: "Verified Buyer" },
    { name: "Mohit Patel", image: "https://randomuser.me/api/portraits/men/75.jpg", quote: "Best online shopping platform. Will definitely order again!", verified: "Verified Buyer" }
];

const shopCategories = [
    { name: "Ethnic Wear", count: "Admin Curated", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80" },
    { name: "Watches", count: "Admin Curated", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80" },
    { name: "Shoes", count: "Admin Curated", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80" },
    { name: "Bags", count: "Admin Curated", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80" }
];

const WELCOME_SPLASH_SEEN_KEY = "shopsphere-welcome-seen";

function getSectionProducts(key) {
    return Array.isArray(window.ShopSphereCatalog[key]) ? window.ShopSphereCatalog[key] : [];
}

function getAllSearchProducts() {
    return Object.values(window.ShopSphereCatalog || {}).flat();
}

function getWishlistItems() {
    if (window.ShopSphereStore) {
        return window.ShopSphereStore.read(window.ShopSphereStore.wishlistKey);
    }
    try {
        return JSON.parse(localStorage.getItem("shopsphere-wishlist") || "[]");
    } catch {
        return [];
    }
}

function saveWishlistItems(items) {
    if (window.ShopSphereStore) {
        window.ShopSphereStore.write(window.ShopSphereStore.wishlistKey, items);
        return;
    }
    localStorage.setItem("shopsphere-wishlist", JSON.stringify(items));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}

function getProductLink(product) {
    return `product.html?category=${encodeURIComponent(product.categoryKey)}&product=${encodeURIComponent(product.slug)}`;
}

function isWishlisted(product) {
    return getWishlistItems().some((item) => item.slug === product.slug && item.categoryKey === product.categoryKey);
}

function renderFeatures() {
    document.getElementById("featureGrid").innerHTML = features.map((item) => `
        <div class="col-lg-3 col-sm-6">
            <div class="feature-card">
                <span class="feature-icon"><i class="fa-solid ${item.icon}"></i></span>
                <div>
                    <h6>${item.title}</h6>
                    <p>${item.text}</p>
                </div>
            </div>
        </div>
    `).join("");
}

function renderCategories() {
    document.getElementById("categoryGrid").innerHTML = standardCategories.map((item) => `
        <div class="col-lg col-md-3 col-4">
            <a class="category-item category-link" href="category.html?category=${item.key}" aria-label="Open ${item.name} category">
                <div class="category-thumb">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <h6>${item.name}</h6>
            </a>
        </div>
    `).join("");
}

function productCard(product) {
    const savings = Math.max(0, Number(product.oldPrice || 0) - Number(product.price || 0));
    const badgeText = product.oldPrice > product.price ? `-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% Off` : product.badge;
    const wishlisted = isWishlisted(product);
    return `
        <div class="col-lg-3 col-md-6 product-entry" data-name="${product.name.toLowerCase()}">
            <article class="product-card"
                data-name="${product.name}"
                data-category="${product.category}"
                data-price="${product.price}"
                data-old-price="${product.oldPrice}"
                data-rating="${product.rating}"
                data-reviews="${product.reviews}"
                data-image="${product.images[0]}"
                data-category-key="${product.categoryKey}"
                data-slug="${product.slug}"
                data-link="${getProductLink(product)}">
                <div class="product-media">
                    <span class="sale-chip">${badgeText || "New"}</span>
                    <button class="wishlist-btn ${wishlisted ? "is-active" : ""}" aria-label="Add to wishlist" type="button">
                        <i class="${wishlisted ? "fa-solid" : "fa-regular"} fa-heart"></i>
                    </button>
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="product-body">
                    <span class="product-tag">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="rating-row">
                        <span><i class="fa-solid fa-star text-warning me-1"></i>(${product.reviews})</span>
                        <span class="rating-chip"><i class="fa-solid fa-star me-1"></i>${product.rating}</span>
                    </div>
                    <div class="price-line">
                        <span class="price-current">${formatCurrency(product.price)}</span>
                        <span class="price-old">${formatCurrency(product.oldPrice)}</span>
                    </div>
                    <div class="save-line">You save ${formatCurrency(savings)}</div>
                    <div class="product-actions">
                        <button class="btn btn-ghost quick-view-btn" type="button"><i class="fa-regular fa-eye me-1"></i>Quick View</button>
                        <button class="btn btn-cart add-cart-btn" type="button"><i class="fa-solid fa-cart-plus me-1"></i>Add</button>
                    </div>
                </div>
            </article>
        </div>
    `;
}

function renderProductGrid(hostId, products, emptyMessage) {
    const host = document.getElementById(hostId);
    if (!host) {
        return;
    }
    host.innerHTML = products.length
        ? products.map(productCard).join("")
        : `<div class="col-12"><div class="simple-panel text-center py-5"><h3>No products added yet</h3><p class="mb-0">${emptyMessage}</p></div></div>`;
}

function renderProducts() {
    renderProductGrid("risingStarsGrid", getSectionProducts("rising-stars"), "Admin-added Rising Stars products will appear here.");
    renderProductGrid("luxeDealsGrid", getSectionProducts("luxe-grand-deals"), "Admin-added Luxe Grand Deals products will appear here.");
}

function renderBanners() {
    document.getElementById("bannerGrid").innerHTML = banners.map((banner) => `
        <div class="col-md-6">
            <div class="promo-banner ${banner.className || ""}" style="background-image: url('${banner.image}')">
                <div class="promo-content">
                    <span class="eyebrow-pill">${banner.badge}</span>
                    <h3>${banner.title}</h3>
                    <p>${banner.text}</p>
                    <button class="btn banner-action-btn" data-banner="${banner.key}" type="button">${banner.button}</button>
                </div>
            </div>
        </div>
    `).join("");
}

function renderTestimonials() {
    document.getElementById("testimonialGrid").innerHTML = testimonials.map((item) => `
        <div class="col-lg-4">
            <article class="testimonial-card">
                <div class="stars">
                    <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                </div>
                <p>"${item.quote}"</p>
                <div class="reviewer">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h6>${item.name}</h6>
                        <div class="verified">${item.verified}</div>
                    </div>
                </div>
            </article>
        </div>
    `).join("");
}

function renderShopCategories() {
    document.getElementById("shopCategoryGrid").innerHTML = shopCategories.map((item) => `
        <div class="col-lg-3 col-md-6">
            <article class="shop-category-card" style="background-image: url('${item.image}')">
                <div class="content">
                    <h4>${item.name}</h4>
                    <p class="mb-0">${item.count}</p>
                </div>
            </article>
        </div>
    `).join("");
}

function updateStoreBadges() {
    if (window.ShopSphereStoreUI) {
        window.ShopSphereStoreUI.syncStoreBadges();
    }
}

function showToast(message) {
    const host = document.getElementById("toastHost");
    const toast = document.createElement("div");
    toast.className = "floating-toast";
    toast.textContent = message;
    host.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2200);
}

function getProductPayloadFromCard(card) {
    return {
        categoryKey: card.dataset.categoryKey,
        slug: card.dataset.slug,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        oldPrice: Number(card.dataset.oldPrice),
        image: card.dataset.image,
        size: "M"
    };
}

function syncWishlistButton(button, isActive) {
    button.classList.toggle("is-active", isActive);
    const icon = button.querySelector("i");
    if (!icon) {
        return;
    }
    icon.classList.toggle("fa-regular", !isActive);
    icon.classList.toggle("fa-solid", isActive);
}

function showQuickView(card) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("quickViewModal"));
    document.getElementById("quickViewImage").src = card.dataset.image;
    document.getElementById("quickViewImage").alt = card.dataset.name;
    document.getElementById("quickViewTag").textContent = card.dataset.category;
    document.getElementById("quickViewName").textContent = card.dataset.name;
    document.getElementById("quickViewMeta").textContent = `${card.dataset.rating} star rating | ${card.dataset.reviews} reviews`;
    document.getElementById("quickViewPrice").textContent = formatCurrency(card.dataset.price);
    document.getElementById("quickViewOldPrice").textContent = formatCurrency(card.dataset.oldPrice);
    document.getElementById("quickViewSave").textContent = `You save ${formatCurrency(Number(card.dataset.oldPrice) - Number(card.dataset.price))}`;
    document.getElementById("quickViewLink").href = card.dataset.link;
    modal.show();
}

function toggleWishlist(card) {
    const payload = getProductPayloadFromCard(card);
    const items = getWishlistItems();
    const index = items.findIndex((item) => item.slug === payload.slug && item.categoryKey === payload.categoryKey);
    const button = card.querySelector(".wishlist-btn");

    if (index >= 0) {
        items.splice(index, 1);
        syncWishlistButton(button, false);
        showToast("Removed from wishlist.");
    } else {
        items.unshift(payload);
        syncWishlistButton(button, true);
        showToast("Added to wishlist.");
    }

    saveWishlistItems(items);
    updateStoreBadges();
    renderWishlistPanel();
}

function getShowcaseConfig(key) {
    const configs = {
        "rising-stars": {
            title: "Rising Stars",
            text: "Trending products that everyone is loving.",
            items: getSectionProducts("rising-stars"),
            backText: "Back to Rising Stars",
            backHref: "#rising-stars"
        },
        "luxe-deals": {
            title: "Luxe Grand Deals",
            text: "Premium products at unbeatable prices.",
            items: getSectionProducts("luxe-grand-deals"),
            backText: "Back to Luxe Deals",
            backHref: "#luxe-grand-deals"
        },
        "flat-50-off": {
            title: "Flat 50% Off Picks",
            text: "Premium sale products unlocked from the campaign banner.",
            items: getSectionProducts("flat-50-off"),
            backText: "Back to Offers",
            backHref: "#bannerGrid"
        },
        "summer-collection": {
            title: "Summer Collection",
            text: "Lightweight, sunny-day styles from our fresh seasonal drop.",
            items: getSectionProducts("summer-collection"),
            backText: "Back to Offers",
            backHref: "#bannerGrid"
        }
    };
    return configs[key];
}

let activeShowcaseKey = "";

function renderPromoShowcase(key) {
    const promo = getShowcaseConfig(key);
    if (!promo) {
        return;
    }

    activeShowcaseKey = key;
    document.getElementById("promoShowcaseTitle").textContent = promo.title;
    document.getElementById("promoShowcaseText").textContent = promo.items.length
        ? promo.text
        : "Admin-added products for this collection will appear here.";
    document.getElementById("promoShowcaseGrid").innerHTML = promo.items.length
        ? promo.items.map(productCard).join("")
        : `<div class="col-12"><div class="simple-panel text-center py-5"><h3>No products added yet</h3><p class="mb-0">Admin-added products for this collection will appear here.</p></div></div>`;
    const backLink = document.getElementById("promoBackLink");
    backLink.textContent = promo.backText;
    backLink.href = promo.backHref;
    document.getElementById("promoShowcase").classList.remove("d-none");
    document.getElementById("promoShowcase").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSearchResults(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        if (activeShowcaseKey) {
            renderPromoShowcase(activeShowcaseKey);
        } else {
            document.getElementById("promoShowcase").classList.add("d-none");
        }
        return;
    }

    const matches = getAllSearchProducts().filter((product) => {
        const haystack = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();
        return haystack.includes(normalized);
    });

    activeShowcaseKey = "";
    document.getElementById("promoShowcaseTitle").textContent = `Search Results for "${query}"`;
    document.getElementById("promoShowcaseText").textContent = matches.length
        ? `${matches.length} product${matches.length > 1 ? "s" : ""} found.`
        : "No products matched your search. Try another keyword.";
    document.getElementById("promoShowcaseGrid").innerHTML = matches.length
        ? matches.map(productCard).join("")
        : `<div class="col-12"><div class="simple-panel text-center py-5"><h3>No matches found</h3><p class="mb-0">Admin-added products will appear here once available.</p></div></div>`;
    document.getElementById("promoBackLink").textContent = "Back to Home";
    document.getElementById("promoBackLink").href = "#rising-stars";
    document.getElementById("promoShowcase").classList.remove("d-none");
    document.getElementById("promoShowcase").scrollIntoView({ behavior: "smooth", block: "start" });
}

function addToCart(card) {
    const payload = getProductPayloadFromCard(card);
    window.ShopSphereStore.addCart(payload);
    updateStoreBadges();
    showToast("Item added to cart.");
}

function renderWishlistPanel() {
    const host = document.getElementById("wishlistContent");
    if (!host) {
        return;
    }

    const wishlist = getWishlistItems();
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
                    <a class="btn btn-cart btn-sm" href="${getProductLink(item)}">Open</a>
                    <button class="btn btn-ghost btn-sm remove-wishlist-btn" data-category="${item.categoryKey}" data-slug="${item.slug}" type="button">Remove</button>
                </div>
            </div>
        </article>
    `).join("");
}

function syncWishlistButtons() {
    const wishlist = getWishlistItems();
    document.querySelectorAll(".product-card .wishlist-btn").forEach((button) => {
        const card = button.closest(".product-card");
        const active = wishlist.some((item) => item.slug === card.dataset.slug && item.categoryKey === card.dataset.categoryKey);
        syncWishlistButton(button, active);
    });
}

function setupInteractions() {
    document.addEventListener("click", (event) => {
        const addBtn = event.target.closest(".add-cart-btn");
        const quickBtn = event.target.closest(".quick-view-btn");
        const wishlistBtn = event.target.closest(".wishlist-btn");
        const bannerBtn = event.target.closest(".banner-action-btn");
        const viewAllBtn = event.target.closest(".view-all-link");
        const removeWishlistBtn = event.target.closest(".remove-wishlist-btn");
        const wishlistOpenTrigger = event.target.closest('[data-bs-target="#wishlistCanvas"]');

        if (addBtn) {
            addToCart(addBtn.closest(".product-card"));
            return;
        }
        if (quickBtn) {
            showQuickView(quickBtn.closest(".product-card"));
            return;
        }
        if (wishlistBtn) {
            toggleWishlist(wishlistBtn.closest(".product-card"));
            return;
        }
        if (removeWishlistBtn) {
            const items = getWishlistItems().filter((item) => !(item.slug === removeWishlistBtn.dataset.slug && item.categoryKey === removeWishlistBtn.dataset.category));
            saveWishlistItems(items);
            renderWishlistPanel();
            syncWishlistButtons();
            updateStoreBadges();
            showToast("Removed from wishlist.");
            return;
        }
        if (bannerBtn) {
            renderPromoShowcase(bannerBtn.dataset.banner);
            syncWishlistButtons();
            return;
        }
        if (viewAllBtn) {
            event.preventDefault();
            renderPromoShowcase(viewAllBtn.dataset.collection);
            syncWishlistButtons();
            return;
        }
        if (wishlistOpenTrigger) {
            renderWishlistPanel();
        }
    });

    document.getElementById("searchInput").addEventListener("input", (event) => {
        renderSearchResults(event.target.value.trim());
        syncWishlistButtons();
    });

    document.getElementById("newsletterForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.getElementById("newsletterEmail");
        if (!input.value.trim()) {
            showToast("Please enter your email address.");
            return;
        }
        showToast("Thanks for subscribing.");
        event.currentTarget.reset();
    });
}

function setupWelcomeSplash() {
    const splash = document.getElementById("welcomeSplash");
    if (!splash) {
        return;
    }
    if (sessionStorage.getItem(WELCOME_SPLASH_SEEN_KEY) === "true") {
        splash.classList.add("is-hidden");
        return;
    }
    document.body.classList.add("splash-active");
    window.setTimeout(() => {
        splash.classList.add("is-hidden");
        document.body.classList.remove("splash-active");
        sessionStorage.setItem(WELCOME_SPLASH_SEEN_KEY, "true");
    }, 1800);
}

function init() {
    renderFeatures();
    renderCategories();
    renderProducts();
    renderBanners();
    renderTestimonials();
    renderShopCategories();
    renderWishlistPanel();
    syncWishlistButtons();
    updateStoreBadges();
    setupInteractions();
    setupWelcomeSplash();
}

init();
