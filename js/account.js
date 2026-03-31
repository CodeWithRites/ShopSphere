const PROFILE_CACHE_KEY = "shopsphere-profile-details";

function getAuthUserSafe() {
    return window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser ? window.ShopSphereAuth.getAuthUser() : null;
}

function readProfileCache() {
    try {
        return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}");
    } catch {
        return {};
    }
}

function setText(id, value) {
    const node = document.getElementById(id);
    if (node) {
        node.textContent = value;
    }
}

function getYearLabel(timestamp) {
    const value = Number(timestamp || Date.now());
    return new Date(value).getFullYear().toString();
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
                <p>${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.price)}</p>
                <div class="d-flex gap-2">
                    <a class="btn btn-cart btn-sm" href="product.html?category=${encodeURIComponent(item.categoryKey)}&product=${encodeURIComponent(item.slug)}">Open</a>
                    <button class="btn btn-ghost btn-sm remove-wishlist-btn" data-category="${item.categoryKey}" data-slug="${item.slug}" type="button">Remove</button>
                </div>
            </div>
        </article>
    `).join("");
}

function updateAvatar(name) {
    const avatar = document.getElementById("accountAvatar");
    if (!avatar) {
        return;
    }
    avatar.textContent = (name || "S").trim().charAt(0).toUpperCase();
}

function renderAddressPreview(address) {
    const host = document.getElementById("accountAddressPreview");
    if (!host) {
        return;
    }

    if (!address) {
        host.innerHTML = `<p class="mb-0 text-muted">No saved address found yet. Add one from My Addresses.</p>`;
        return;
    }

    host.innerHTML = `
        <span class="address-tag">${address.type || "Home"}</span>
        <h4 class="mt-3 mb-2">${address.fullName}</h4>
        <p class="mb-1 text-muted">${address.phone || "Phone not added"}</p>
        <p class="mb-0">${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.city}, ${address.state} - ${address.pincode}</p>
    `;
}

async function loadProfileData() {
    const authUser = getAuthUserSafe();
    if (!authUser) {
        window.location.href = "login.html";
        return;
    }

    let profileName = authUser.name || "ShopSphere User";
    let profileEmail = authUser.email || "user@example.com";
    let memberSince = "2026";
    let profilePhone = "";
    const cachedProfile = readProfileCache();

    if (cachedProfile.name) {
        profileName = cachedProfile.name;
    }
    if (cachedProfile.email) {
        profileEmail = cachedProfile.email;
    }
    if (cachedProfile.phone) {
        profilePhone = cachedProfile.phone;
    }

    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        const currentUser = window.ShopSphereFirebase.getCurrentUser && window.ShopSphereFirebase.getCurrentUser();
        if (currentUser && window.ShopSphereFirebase.getUserProfile) {
            try {
                const profile = await window.ShopSphereFirebase.getUserProfile(currentUser.uid);
                if (profile) {
                    profileName = profile.name || profileName;
                    profileEmail = profile.email || profileEmail;
                    profilePhone = profile.phone || profilePhone;
                    memberSince = getYearLabel(profile.createdAt && profile.createdAt.seconds ? profile.createdAt.seconds * 1000 : Date.now());
                }
            } catch {
                // Keep fallback values if profile fetch fails.
            }
        }
    }

    setText("accountName", profileName);
    setText("accountNameHero", profileName);
    setText("accountEmail", profileEmail);
    setText("accountEmailHero", profileEmail);
    setText("accountMemberSince", memberSince);
    updateAvatar(profileName);

    const wishlist = window.ShopSphereStore ? window.ShopSphereStore.read(window.ShopSphereStore.wishlistKey) : [];
    const cart = window.ShopSphereStore ? window.ShopSphereStore.read(window.ShopSphereStore.cartKey) : [];
    const orders = window.ShopSphereOrderBook ? await window.ShopSphereOrderBook.loadOrders() : [];
    const addresses = window.ShopSphereAddressBook ? await window.ShopSphereAddressBook.loadAddresses() : [];
    const selectedAddress = window.ShopSphereAddressBook ? await window.ShopSphereAddressBook.getSelectedAddress() : null;

    const firstAddress = selectedAddress || addresses[0] || null;
    const phone = profilePhone || (firstAddress && firstAddress.phone ? firstAddress.phone : "Not added yet");

    setText("accountPhone", phone);
    setText("accountOrdersCount", String(orders.length));
    setText("accountWishlistCount", String(wishlist.length));
    setText("accountAddressCount", String(addresses.length));
    renderAddressPreview(firstAddress);

    if (window.ShopSphereStoreUI) {
        window.ShopSphereStoreUI.syncStoreBadges();
    }

    renderWishlistPanel();
}

function setupAccountInteractions() {
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
        setText("accountWishlistCount", String(window.ShopSphereStore.read(window.ShopSphereStore.wishlistKey).length));
        if (window.ShopSphereStoreUI) {
            window.ShopSphereStoreUI.syncStoreBadges();
        }
    });
}

setupAccountInteractions();
loadProfileData();
