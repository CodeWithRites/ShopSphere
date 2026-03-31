const ADMIN_PRODUCTS_KEY = "shopsphere-admin-products";

const categoryConfig = {
    mens: { title: "Mens Collection", description: "Sharp layers, polished basics, and statement essentials for everyday wear." },
    womens: { title: "Womens Collection", description: "Elegant silhouettes, seasonal colors, and bold pieces for standout looks." },
    kids: { title: "Kids Collection", description: "Comfort-first everyday outfits for active little shoppers." },
    boys: { title: "Boys Collection", description: "Casual cool styles built for play, comfort, and daily energy." },
    girls: { title: "Girls Collection", description: "Fresh colors, light layers, and playful looks for every day." },
    "home-appliances": { title: "Home Appliances", description: "Useful home upgrades and practical everyday essentials." },
    beauty: { title: "Beauty Collection", description: "Self-care, skincare, and beauty favorites curated for glow." },
    electronics: { title: "Electronics", description: "Trending gadgets and modern essentials for daily life." },
    food: { title: "Food Collection", description: "Tasty finds and pantry picks selected for everyday cravings." },
    "rising-stars": { title: "Rising Stars", description: "Trending products that everyone is loving." },
    "flat-50-off": { title: "Flat 50% Off Picks", description: "Premium sale products unlocked from the campaign banner." },
    "summer-collection": { title: "Summer Collection", description: "Lightweight, sunny-day styles from our fresh seasonal drop." },
    "luxe-grand-deals": { title: "Luxe Grand Deals", description: "Premium products at unbeatable prices." }
};

const emptyCatalog = Object.keys(categoryConfig).reduce((acc, key) => {
    acc[key] = [];
    return acc;
}, {});

function readManagedCatalog() {
    try {
        return JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY) || "{}");
    } catch {
        return {};
    }
}

function normalizeProduct(product, categoryKey) {
    const image = product.image || (Array.isArray(product.images) && product.images[0]) || "";
    const gallery = Array.isArray(product.images) && product.images.length ? product.images : [image, image, image, image].filter(Boolean);
    const images = gallery.length >= 4 ? gallery.slice(0, 4) : [...gallery, ...new Array(Math.max(0, 4 - gallery.length)).fill(gallery[0] || "")];

    return {
        slug: product.slug || `product-${Date.now()}`,
        category: categoryConfig[categoryKey] ? categoryConfig[categoryKey].title : "ShopSphere Collection",
        name: product.name || "Untitled Product",
        price: Number(product.price || product.offerPrice || 0),
        oldPrice: Number(product.oldPrice || 0),
        rating: Number(product.rating || 0),
        reviews: Number(product.reviews || 0),
        badge: product.badge || "New",
        color: product.color || "Not specified",
        fabric: product.fabric || "Not specified",
        pattern: product.pattern || "Solid",
        collar: product.collar || "Not specified",
        sleeve: product.sleeve || "Not specified",
        packOf: product.packOf || "1",
        stock: Number(product.stock || 0),
        inStock: typeof product.inStock === "boolean" ? product.inStock : Number(product.stock || 0) > 0,
        sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["Free Size"],
        description: product.description || "Freshly added by admin for the ShopSphere catalog.",
        images,
        image,
        categoryKey
    };
}

function mergeCatalogs(baseCatalog, managedCatalog) {
    const nextCatalog = {};
    const keys = new Set([...Object.keys(baseCatalog), ...Object.keys(managedCatalog), ...Object.keys(categoryConfig)]);

    keys.forEach((categoryKey) => {
        const baseList = Array.isArray(baseCatalog[categoryKey]) ? baseCatalog[categoryKey] : [];
        const managedList = Array.isArray(managedCatalog[categoryKey]) ? managedCatalog[categoryKey] : [];
        const selectedList = managedList.length ? managedList : baseList;
        nextCatalog[categoryKey] = selectedList.map((item) => normalizeProduct(item, categoryKey));
    });

    return nextCatalog;
}

window.ShopSphereCategoryConfig = categoryConfig;
window.ShopSphereCatalog = mergeCatalogs(emptyCatalog, readManagedCatalog());
window.ShopSphereDefaultCatalog = emptyCatalog;
window.ShopSphereAdminProducts = {
    key: ADMIN_PRODUCTS_KEY,
    read: readManagedCatalog,
    write(catalog) {
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(catalog));
        window.ShopSphereCatalog = mergeCatalogs(window.ShopSphereDefaultCatalog, catalog);
    }
};

window.ShopSphereStore = {
    cartKey: "shopsphere-cart",
    wishlistKey: "shopsphere-wishlist",
    locationKey: "shopsphere-location",
    read(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
            return [];
        }
    },
    write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    addCart(item) {
        const cart = this.read(this.cartKey);
        const existing = cart.find((entry) => entry.slug === item.slug && entry.categoryKey === item.categoryKey && entry.size === item.size);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        this.write(this.cartKey, cart);
    },
    addWishlist(item) {
        const wishlist = this.read(this.wishlistKey);
        if (!wishlist.find((entry) => entry.slug === item.slug && entry.categoryKey === item.categoryKey)) {
            wishlist.unshift(item);
            this.write(this.wishlistKey, wishlist);
        }
    },
    removeWishlist(slug, categoryKey) {
        const wishlist = this.read(this.wishlistKey).filter((entry) => !(entry.slug === slug && entry.categoryKey === categoryKey));
        this.write(this.wishlistKey, wishlist);
    },
    setLocation(location) {
        localStorage.setItem(this.locationKey, location);
    },
    getLocation() {
        return localStorage.getItem(this.locationKey) || "";
    },
    getProduct(categoryKey, slug) {
        const list = window.ShopSphereCatalog[categoryKey] || [];
        return list.find((item) => item.slug === slug) || list[0] || null;
    }
};
