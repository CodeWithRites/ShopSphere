const PROFILE_CACHE_KEY = "shopsphere-profile-details";

function getProfileAuthUser() {
    return window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser ? window.ShopSphereAuth.getAuthUser() : null;
}

function readProfileCache() {
    try {
        return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}");
    } catch {
        return {};
    }
}

function writeProfileCache(profile) {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

function splitName(fullName) {
    const name = (fullName || "").trim();
    if (!name) {
        return { firstName: "", lastName: "" };
    }

    const parts = name.split(/\s+/);
    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ")
    };
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

function getSelectedGender() {
    const checked = document.querySelector('input[name="profileGender"]:checked');
    return checked ? checked.value : "";
}

async function loadProfileDetails() {
    const authUser = getProfileAuthUser();
    if (!authUser) {
        window.location.href = "login.html";
        return;
    }

    let profile = {
        name: authUser.name || "ShopSphere User",
        email: authUser.email || "",
        phone: "",
        gender: ""
    };

    profile = {
        ...profile,
        ...readProfileCache()
    };

    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        const currentUser = window.ShopSphereFirebase.getCurrentUser && window.ShopSphereFirebase.getCurrentUser();
        if (currentUser && window.ShopSphereFirebase.getUserProfile) {
            try {
                const firebaseProfile = await window.ShopSphereFirebase.getUserProfile(currentUser.uid);
                if (firebaseProfile) {
                    profile = {
                        ...profile,
                        ...firebaseProfile
                    };
                }
            } catch {
                // Keep fallback values if loading fails.
            }
        }
    }

    const { firstName, lastName } = splitName(profile.name);
    document.getElementById("firstNameInput").value = firstName;
    document.getElementById("lastNameInput").value = lastName;
    document.getElementById("profileEmailInput").value = profile.email || "";
    document.getElementById("profilePhoneInput").value = profile.phone || "";

    if (profile.gender) {
        const radio = document.querySelector(`input[name="profileGender"][value="${profile.gender}"]`);
        if (radio) {
            radio.checked = true;
        }
    }
}

async function saveProfileDetails() {
    const firstName = document.getElementById("firstNameInput").value.trim();
    const lastName = document.getElementById("lastNameInput").value.trim();
    const authUser = getProfileAuthUser();
    const email = authUser && authUser.email ? authUser.email : document.getElementById("profileEmailInput").value.trim();
    const phone = document.getElementById("profilePhoneInput").value.trim();
    const gender = getSelectedGender();
    const fullName = `${firstName} ${lastName}`.trim();

    if (!firstName || !email) {
        window.alert("Please fill first name and email.");
        return;
    }

    const nextAuth = {
        name: fullName || authUser.name || "ShopSphere User",
        email: email || authUser.email || ""
    };
    window.ShopSphereAuth.setAuthUser(nextAuth);
    window.ShopSphereAuth.syncAuthUI();
    writeProfileCache({
        name: nextAuth.name,
        email: nextAuth.email,
        phone,
        gender
    });

    if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        const currentUser = window.ShopSphereFirebase.getCurrentUser && window.ShopSphereFirebase.getCurrentUser();
        if (currentUser && window.ShopSphereFirebase.updateUserProfile) {
            try {
                await window.ShopSphereFirebase.updateUserProfile(currentUser.uid, {
                    name: nextAuth.name,
                    email: nextAuth.email,
                    phone,
                    gender
                });
            } catch {
                // Keep local update if Firebase save fails.
            }
        }
    }

    window.alert("Profile updated successfully.");
    window.location.href = "account.html";
}

function setupProfileInteractions() {
    document.getElementById("saveProfileBtn").addEventListener("click", () => {
        saveProfileDetails();
    });

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

renderWishlistPanel();
setupProfileInteractions();
loadProfileDetails();
