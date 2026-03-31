(function initAdminProducts() {
    if (!window.ShopSphereAdmin || !window.ShopSphereAdmin.ensureAdminAccess()) {
        return;
    }

    const form = document.getElementById("adminProductForm");
    const previewList = document.getElementById("adminProductPreviewList");
    const catalogFilter = document.getElementById("adminCatalogFilter");
    let editingSlug = "";
    let editingCategoryKey = "";

    function getFormValues() {
        return {
            categoryKey: document.getElementById("adminProductCategory").value.trim(),
            name: document.getElementById("adminProductName").value.trim(),
            slug: document.getElementById("adminProductSlug").value.trim().toLowerCase(),
            badge: document.getElementById("adminProductBadge").value.trim(),
            price: Number(document.getElementById("adminProductPrice").value),
            oldPrice: Number(document.getElementById("adminProductOldPrice").value),
            stock: Number(document.getElementById("adminProductStock").value),
            rating: Number(document.getElementById("adminProductRating").value),
            color: document.getElementById("adminProductColor").value.trim(),
            fabric: document.getElementById("adminProductFabric").value.trim(),
            collar: document.getElementById("adminProductCollar").value.trim(),
            sleeve: document.getElementById("adminProductSleeve").value.trim(),
            reviews: Number(document.getElementById("adminProductReviews").value),
            sizes: document.getElementById("adminProductSizes").value.split(",").map((item) => item.trim()).filter(Boolean),
            description: document.getElementById("adminProductDescription").value.trim(),
            image: document.getElementById("adminProductImage").value.trim()
        };
    }

    function fillForm(product) {
        document.getElementById("adminProductCategory").value = product.categoryKey;
        document.getElementById("adminProductName").value = product.name;
        document.getElementById("adminProductSlug").value = product.slug;
        document.getElementById("adminProductBadge").value = product.badge;
        document.getElementById("adminProductPrice").value = product.price;
        document.getElementById("adminProductOldPrice").value = product.oldPrice;
        document.getElementById("adminProductStock").value = product.stock;
        document.getElementById("adminProductRating").value = product.rating;
        document.getElementById("adminProductColor").value = product.color;
        document.getElementById("adminProductFabric").value = product.fabric;
        document.getElementById("adminProductCollar").value = product.collar;
        document.getElementById("adminProductSleeve").value = product.sleeve;
        document.getElementById("adminProductReviews").value = product.reviews;
        document.getElementById("adminProductSizes").value = (product.sizes || []).join(", ");
        document.getElementById("adminProductDescription").value = product.description || "";
        document.getElementById("adminProductImage").value = product.images && product.images[0] ? product.images[0] : "";
    }

    function deleteProduct(categoryKey, slug) {
        const managedCatalog = window.ShopSphereAdminProducts.read();
        const fallback = Array.isArray(managedCatalog[categoryKey]) ? managedCatalog[categoryKey] : (window.ShopSphereCatalog[categoryKey] || []);
        managedCatalog[categoryKey] = fallback.filter((item) => item.slug !== slug);
        window.ShopSphereAdminProducts.write(managedCatalog);
    }

    function renderPreview() {
        const selectedCategory = catalogFilter ? catalogFilter.value : "all";
        const products = window.ShopSphereAdmin.flattenCatalog().filter((product) => {
            return selectedCategory === "all" ? true : product.categoryKey === selectedCategory;
        });
        previewList.innerHTML = products.length ? products.map((product) => `
            <div class="admin-list-item">
                <div class="admin-list-item__top">
                    <div>
                        <strong>${product.name}</strong>
                        <p>${product.categoryKey} • ${window.ShopSphereAdmin.formatPrice(product.price)} • ${product.stock} qty</p>
                    </div>
                    <span class="admin-status ${product.inStock === false ? "admin-status--outofstock" : "admin-status--instock"}">
                        ${product.inStock === false ? "Out of Stock" : "In Stock"}
                    </span>
                </div>
                <p>${product.description || "No description added yet."}</p>
                <div class="admin-action-grid">
                    <input class="form-control" type="number" value="${Number(product.price || 0)}" data-field="price">
                    <input class="form-control" type="number" value="${Number(product.stock || 0)}" data-field="stock">
                    <button class="btn btn-outline-secondary" type="button" data-action="toggle">${product.inStock === false ? "In Stock" : "Out Stock"}</button>
                    <button class="btn admin-primary-btn" type="button" data-action="edit">Edit</button>
                    <button class="btn btn-outline-dark" type="button" data-action="save-inline">Save</button>
                    <button class="btn btn-outline-danger" type="button" data-action="delete">Delete</button>
                </div>
            </div>
        `).join("") : `<div class="admin-empty-state">No products available yet.</div>`;

        [...previewList.querySelectorAll(".admin-list-item")].forEach((card, index) => {
            const product = products[index];

            card.addEventListener("click", (event) => {
                const button = event.target.closest("button");
                if (!button) {
                    return;
                }

                if (button.dataset.action === "edit") {
                    editingSlug = product.slug;
                    editingCategoryKey = product.categoryKey;
                    fillForm(product);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }

                if (button.dataset.action === "delete") {
                    deleteProduct(product.categoryKey, product.slug);
                    renderPreview();
                    return;
                }

                if (button.dataset.action === "toggle") {
                    window.ShopSphereAdmin.updateManagedProduct(product.categoryKey, product.slug, {
                        inStock: !product.inStock
                    });
                    renderPreview();
                    return;
                }

                if (button.dataset.action === "save-inline") {
                    const price = Number(card.querySelector('[data-field="price"]').value);
                    const stock = Number(card.querySelector('[data-field="stock"]').value);
                    window.ShopSphereAdmin.updateManagedProduct(product.categoryKey, product.slug, {
                        price,
                        stock,
                        inStock: stock > 0
                    });
                    renderPreview();
                }
            });
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = getFormValues();

        if (!values.categoryKey || !values.name || !values.slug || !values.image || !values.description) {
            window.alert("Please fill all product details.");
            return;
        }

        const nextProduct = {
            slug: values.slug,
            name: values.name,
            badge: values.badge,
            price: values.price,
            oldPrice: values.oldPrice,
            stock: values.stock,
            rating: values.rating,
            color: values.color,
            fabric: values.fabric,
            collar: values.collar,
            sleeve: values.sleeve,
            reviews: values.reviews,
            sizes: values.sizes,
            description: values.description,
            image: values.image,
            images: [values.image, values.image, values.image, values.image],
            pattern: "Solid",
            packOf: "1",
            inStock: values.stock > 0
        };

        if (editingSlug && editingCategoryKey) {
            if (!(editingSlug === values.slug && editingCategoryKey === values.categoryKey)) {
                deleteProduct(editingCategoryKey, editingSlug);
            }
            editingSlug = "";
            editingCategoryKey = "";
        }

        window.ShopSphereAdmin.upsertManagedProduct(values.categoryKey, nextProduct);
        form.reset();
        renderPreview();
        window.alert("Product saved successfully.");
    });

    if (catalogFilter) {
        catalogFilter.addEventListener("change", renderPreview);
    }

    renderPreview();
})();
