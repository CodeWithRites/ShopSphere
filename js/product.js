function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get("category") || "mens",
        product: params.get("product") || "urban-leather-jacket"
    };
}

function getActiveProduct() {
    const params = getParams();
    return window.ShopSphereStore.getProduct(params.category, params.product);
}

function renderBreadcrumb(product, categoryKey) {
    document.getElementById("productBreadcrumb").innerHTML = `
        <a href="index.html">Home</a> /
        <a href="category.html?category=${encodeURIComponent(categoryKey)}">${product.category}</a> /
        <span>${product.name}</span>
    `;
}

function renderProduct(product) {
    const discount = product.oldPrice > 0 ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image, product.image, product.image, product.image].filter(Boolean);
    const mainImage = images[0] || "";
    const sideImage = images[1] || mainImage;
    const thumbImages = images.slice(2).length ? images.slice(2) : [mainImage, sideImage];

    document.title = `${product.name} - ShopSphere`;
    document.getElementById("mainProductImage").src = mainImage;
    document.getElementById("sideProductImage").src = sideImage;
    document.getElementById("productBadgeTag").textContent = product.badge;
    document.getElementById("productTitle").textContent = product.name;
    document.getElementById("productRatingText").textContent = `${product.rating}`;
    document.getElementById("ratingBox").innerHTML = `${product.rating} <i class="fa-solid fa-star text-success"></i>`;
    document.getElementById("reviewCountText").textContent = `${product.reviews.toLocaleString("en-IN")} ratings`;
    document.getElementById("discountPercent").textContent = `${discount}% off`;
    document.getElementById("oldPriceLine").textContent = formatCurrency(product.oldPrice);
    document.getElementById("currentPriceLine").textContent = formatCurrency(product.price);

    document.getElementById("productThumbGrid").innerHTML = thumbImages.map((image) => `
        <div class="product-gallery-thumb">
            <img src="${image}" alt="${product.name}">
        </div>
    `).join("");

    document.getElementById("sizeGrid").innerHTML = product.sizes.map((size, index) => `
        <button class="size-btn ${index === 1 ? "active" : ""}" type="button">${size}</button>
    `).join("");

    document.getElementById("highlightGrid").innerHTML = [
        ["Pack of", product.packOf],
        ["Fabric", product.fabric],
        ["Sleeve", product.sleeve],
        ["Pattern", product.pattern],
        ["Collar", product.collar],
        ["Color", product.color]
    ].map(([label, value]) => `
        <article class="highlight-item">
            <span>${label}</span>
            <strong>${value}</strong>
        </article>
    `).join("");
}

function getSelectedSize(product) {
    const active = document.querySelector(".size-btn.active");
    return active ? active.textContent.trim() : product.sizes[0];
}

function getProductPayload(product) {
    const params = getParams();
    return {
        categoryKey: params.category,
        slug: product.slug,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: (product.images && product.images[0]) || product.image || "",
        size: getSelectedSize(product)
    };
}

function getDeliveryDate(location) {
    const base = new Date();
    const map = {
        "Mumbai, Maharashtra": 2,
        "Delhi, India": 3,
        "Bengaluru, Karnataka": 4,
        "Hyderabad, Telangana": 5
    };
    const offset = map[location] || 6;
    base.setDate(base.getDate() + offset);
    return base.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        weekday: "short"
    });
}

function updateDeliveryBlock(location) {
    const locationText = document.getElementById("deliveryLocationText");
    const deliveryDate = document.getElementById("deliveryDateText");
    const activeLocation = location || "Location not set";
    locationText.textContent = activeLocation;
    deliveryDate.textContent = `Delivery by ${getDeliveryDate(activeLocation)}`;
}

function setupLocationSelection() {
    const modalElement = document.getElementById("locationModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const savedLocation = window.ShopSphereStore.getLocation();
    if (savedLocation) {
        updateDeliveryBlock(savedLocation);
    } else {
        updateDeliveryBlock("Location not set");
    }

    document.querySelectorAll(".location-option").forEach((button) => {
        button.addEventListener("click", () => {
            window.ShopSphereStore.setLocation(button.dataset.location);
            updateDeliveryBlock(button.dataset.location);
            modal.hide();
        });
    });

    document.getElementById("saveCustomLocation").addEventListener("click", () => {
        const input = document.getElementById("customLocation");
        const value = input.value.trim();
        if (!value) {
            return;
        }
        window.ShopSphereStore.setLocation(value);
        updateDeliveryBlock(value);
        input.value = "";
        modal.hide();
    });
}

function setupSizeSelection() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest(".size-btn");
        if (!button) {
            return;
        }

        document.querySelectorAll(".size-btn").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
    });
}

function renderWishlist() {
    const host = document.getElementById("wishlistContent");
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

function syncProductButtons(product) {
    const addButton = document.getElementById("addToCartBtn");
    const inCart = window.ShopSphereStore.read(window.ShopSphereStore.cartKey).some((item) => item.slug === product.slug && item.categoryKey === getParams().category);
    addButton.textContent = inCart ? "Go to cart" : "Add to cart";
}

function setupWishlist(product) {
    const wishlistCanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("wishlistCanvas"));
    const button = document.getElementById("wishlistToggleBtn");

    button.addEventListener("click", () => {
        const payload = getProductPayload(product);
        const wishlist = window.ShopSphereStore.read(window.ShopSphereStore.wishlistKey);
        const exists = wishlist.some((item) => item.slug === payload.slug && item.categoryKey === payload.categoryKey);
        if (exists) {
            window.ShopSphereStore.removeWishlist(payload.slug, payload.categoryKey);
            button.classList.remove("is-active");
        } else {
            window.ShopSphereStore.addWishlist(payload);
            button.classList.add("is-active");
        }
        renderWishlist();
        if (window.ShopSphereStoreUI) {
            window.ShopSphereStoreUI.syncStoreBadges();
        }
        wishlistCanvas.show();
    });

    document.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".remove-wishlist-btn");
        if (!removeBtn) {
            return;
        }
        window.ShopSphereStore.removeWishlist(removeBtn.dataset.slug, removeBtn.dataset.category);
        renderWishlist();
        if (window.ShopSphereStoreUI) {
            window.ShopSphereStoreUI.syncStoreBadges();
        }
    });

    const existsOnLoad = window.ShopSphereStore.read(window.ShopSphereStore.wishlistKey).some((item) => item.slug === product.slug && item.categoryKey === getParams().category);
    button.classList.toggle("is-active", existsOnLoad);
    renderWishlist();
}

function setupShare(product) {
    const url = `${window.location.origin}${window.location.pathname}?category=${encodeURIComponent(getParams().category)}&product=${encodeURIComponent(product.slug)}`;
    const shareText = encodeURIComponent(`Check out ${product.name} on ShopSphere`);
    document.getElementById("shareWhatsapp").href = `https://wa.me/?text=${shareText}%20${encodeURIComponent(url)}`;
    document.getElementById("shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    document.getElementById("shareInstagram").href = `https://www.instagram.com/`;

    document.getElementById("shareMore").addEventListener("click", async () => {
        if (navigator.share) {
            await navigator.share({ title: product.name, text: `Check out ${product.name}`, url });
            return;
        }
        await navigator.clipboard.writeText(url);
        window.alert("Product link copied.");
    });
}

function setupCartAndPayment(product) {
    document.getElementById("addToCartBtn").addEventListener("click", () => {
        const button = document.getElementById("addToCartBtn");
        if (button.textContent.trim().toLowerCase() === "go to cart") {
            window.location.href = "cart.html";
            return;
        }
        const payload = getProductPayload(product);
        window.ShopSphereStore.addCart(payload);
        syncProductButtons(product);
        if (window.ShopSphereStoreUI) {
            window.ShopSphereStoreUI.syncStoreBadges();
        }
    });

    document.getElementById("buyNowBtn").addEventListener("click", () => {
        const payload = getProductPayload(product);
        sessionStorage.setItem("shopsphere-buy-now", JSON.stringify(payload));
        window.location.href = "payment.html";
    });
}

function setupHighlightToggle() {
    const section = document.querySelector(".product-highlights");
    const button = document.querySelector(".highlight-toggle");
    if (!section || !button) {
        return;
    }

    button.addEventListener("click", () => {
        section.classList.toggle("is-collapsed");
    });
}

function initProductPage() {
    const params = getParams();
    const product = getActiveProduct();
    if (!product) {
        window.location.href = `category.html?category=${encodeURIComponent(params.category)}`;
        return;
    }
    renderBreadcrumb(product, params.category);
    renderProduct(product);
    setupLocationSelection();
    setupSizeSelection();
    setupWishlist(product);
    setupShare(product);
    setupCartAndPayment(product);
    setupHighlightToggle();
    syncProductButtons(product);
}

initProductPage();
