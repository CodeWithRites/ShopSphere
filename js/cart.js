function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function renderCart() {
    const cart = window.ShopSphereStore.read(window.ShopSphereStore.cartKey);
    const host = document.getElementById("cartItems");

    if (!cart.length) {
        host.innerHTML = `<div class="payment-summary-card"><h4>Your cart is empty</h4><p class="mb-0 text-muted">Add products from the collection to continue.</p></div>`;
        document.getElementById("cartSubtotal").textContent = formatCurrency(0);
        document.getElementById("cartDiscount").textContent = formatCurrency(0);
        document.getElementById("cartTotal").textContent = formatCurrency(0);
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.oldPrice * item.qty), 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = subtotal - total;

    host.innerHTML = cart.map((item) => `
        <article class="cart-item-card mb-3">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h5>${item.name}</h5>
                <p class="mb-2 text-muted">Size: ${item.size}</p>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <strong>${formatCurrency(item.price)}</strong>
                    <span class="text-muted text-decoration-line-through">${formatCurrency(item.oldPrice)}</span>
                </div>
            </div>
            <div class="text-end">
                <div class="qty-controls mb-3">
                    <button type="button" class="qty-btn" data-action="decrease" data-slug="${item.slug}" data-size="${item.size}" data-category="${item.categoryKey}">-</button>
                    <span>${item.qty}</span>
                    <button type="button" class="qty-btn" data-action="increase" data-slug="${item.slug}" data-size="${item.size}" data-category="${item.categoryKey}">+</button>
                </div>
                <button class="btn btn-ghost btn-sm remove-cart-btn" data-slug="${item.slug}" data-size="${item.size}" data-category="${item.categoryKey}" type="button">Remove</button>
            </div>
        </article>
    `).join("");

    document.getElementById("cartSubtotal").textContent = formatCurrency(subtotal);
    document.getElementById("cartDiscount").textContent = formatCurrency(discount);
    document.getElementById("cartTotal").textContent = formatCurrency(total);
}

function updateCartItem(action, target) {
    const cart = window.ShopSphereStore.read(window.ShopSphereStore.cartKey);
    const item = cart.find((entry) => entry.slug === target.slug && entry.size === target.size && entry.categoryKey === target.categoryKey);
    if (!item) {
        return;
    }
    if (action === "increase") {
        item.qty += 1;
    }
    if (action === "decrease") {
        item.qty = Math.max(1, item.qty - 1);
    }
    window.ShopSphereStore.write(window.ShopSphereStore.cartKey, cart);
    renderCart();
}

document.addEventListener("click", (event) => {
    const qtyBtn = event.target.closest(".qty-btn");
    const removeBtn = event.target.closest(".remove-cart-btn");

    if (qtyBtn) {
        updateCartItem(qtyBtn.dataset.action, {
            slug: qtyBtn.dataset.slug,
            size: qtyBtn.dataset.size,
            categoryKey: qtyBtn.dataset.category
        });
    }

    if (removeBtn) {
        const cart = window.ShopSphereStore.read(window.ShopSphereStore.cartKey).filter((item) => !(item.slug === removeBtn.dataset.slug && item.size === removeBtn.dataset.size && item.categoryKey === removeBtn.dataset.category));
        window.ShopSphereStore.write(window.ShopSphereStore.cartKey, cart);
        renderCart();
    }
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
    const selectedMethod = document.querySelector("input[name='cartPaymentMethod']:checked");
    if (selectedMethod) {
        sessionStorage.setItem("shopsphere-payment-method", selectedMethod.value);
    }
    sessionStorage.removeItem("shopsphere-buy-now");
    window.location.href = "payment.html";
});

renderCart();
