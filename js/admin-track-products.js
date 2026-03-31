(function initAdminTrackProducts() {
    if (!window.ShopSphereAdmin || !window.ShopSphereAdmin.ensureAdminAccess()) {
        return;
    }

    const list = document.getElementById("adminTrackProductsList");

    function renderProducts() {
        const products = window.ShopSphereAdmin.flattenCatalog();

        list.innerHTML = products.length ? products.map((product) => `
            <div class="admin-stock-card">
                <div class="admin-stock-card__top">
                    <div>
                        <strong>${product.name}</strong>
                        <p>${product.categoryKey} • ${product.slug}</p>
                    </div>
                    <span class="admin-status ${product.inStock === false ? "admin-status--outofstock" : "admin-status--instock"}">
                        ${product.inStock === false ? "Out of Stock" : "In Stock"}
                    </span>
                </div>
                <div class="admin-action-grid">
                    <input class="form-control" type="number" value="${Number(product.price || 0)}" data-field="price">
                    <input class="form-control" type="number" value="${Number(product.oldPrice || 0)}" data-field="oldPrice">
                    <input class="form-control" type="number" value="${Number(product.stock || 0)}" data-field="stock">
                    <input class="form-control" type="number" step="0.1" min="1" max="5" value="${Number(product.rating || 0)}" data-field="rating">
                    <button class="btn admin-primary-btn" type="button" data-action="save">Save Changes</button>
                    <button class="btn btn-outline-secondary" type="button" data-action="toggle">
                        ${product.inStock === false ? "Mark In Stock" : "Mark Out of Stock"}
                    </button>
                </div>
            </div>
        `).join("") : `<div class="admin-empty-state">No products available for tracking.</div>`;

        [...list.querySelectorAll(".admin-stock-card")].forEach((card, index) => {
            const product = products[index];

            card.addEventListener("click", (event) => {
                const button = event.target.closest("button");
                if (!button) {
                    return;
                }

                const fields = {};
                card.querySelectorAll("[data-field]").forEach((input) => {
                    fields[input.dataset.field] = Number(input.value);
                });

                if (button.dataset.action === "toggle") {
                    window.ShopSphereAdmin.updateManagedProduct(product.categoryKey, product.slug, {
                        inStock: !product.inStock
                    });
                    renderProducts();
                    return;
                }

                window.ShopSphereAdmin.updateManagedProduct(product.categoryKey, product.slug, {
                    price: fields.price,
                    oldPrice: fields.oldPrice,
                    stock: fields.stock,
                    rating: fields.rating,
                    inStock: fields.stock > 0
                });
                renderProducts();
                window.alert("Product tracking details updated.");
            });
        });
    }

    renderProducts();
})();
