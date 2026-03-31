const RAZORPAY_KEY_ID = "rzp_test_SQpo1XZ8nSiMDO";
let paymentItemsCache = [];
let selectedAddressCache = null;

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function getPaymentItems() {
    const buyNow = sessionStorage.getItem("shopsphere-buy-now");
    if (buyNow) {
        return [JSON.parse(buyNow)];
    }
    return window.ShopSphereStore.read(window.ShopSphereStore.cartKey);
}

function getSelectedPaymentMethod() {
    if (document.getElementById("cardPay").checked) {
        return "Credit / Debit Card";
    }
    if (document.getElementById("codPay").checked) {
        return "Cash on Delivery";
    }
    return "UPI / Wallet";
}

function getPaymentTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
}

function updatePlaceOrderButton() {
    const button = document.getElementById("placeOrderBtn");
    button.textContent = getSelectedPaymentMethod() === "Cash on Delivery" ? "Place Order" : "Pay Now";
}

function renderPayment() {
    const items = getPaymentItems();
    paymentItemsCache = items;
    const selectedMethod = sessionStorage.getItem("shopsphere-payment-method");

    document.getElementById("paymentItems").innerHTML = items.map((item) => `
        <div class="payment-summary-card mb-3">
            <div class="d-flex justify-content-between gap-3">
                <div>
                    <h6 class="mb-1">${item.name}</h6>
                    <div class="text-muted">Size: ${item.size}${item.qty ? ` | Qty: ${item.qty}` : ""}</div>
                </div>
                <strong>${formatCurrency(item.price * (item.qty || 1))}</strong>
            </div>
        </div>
    `).join("");

    document.getElementById("paymentTotal").textContent = formatCurrency(getPaymentTotal(items));

    if (selectedMethod) {
        document.getElementById("upiPay").checked = selectedMethod === "UPI / Wallet";
        document.getElementById("cardPay").checked = selectedMethod === "Credit / Debit Card";
        document.getElementById("codPay").checked = selectedMethod === "Cash on Delivery";
    }

    updatePlaceOrderButton();
}

function getAddressMarkup(address) {
    return `
        <strong>${address.fullName}</strong><br>
        <span class="text-muted">${address.phone}</span><br>
        <span>${address.line1}, ${address.line2 ? `${address.line2}, ` : ""}${address.city}, ${address.state} - ${address.pincode}</span>
    `;
}

async function renderSelectedAddress() {
    const host = document.getElementById("paymentLocation");
    const listHost = document.getElementById("paymentAddressList");

    if (!window.ShopSphereAddressBook) {
        host.textContent = window.ShopSphereStore.getLocation() || "Mumbai, Maharashtra";
        return;
    }

    const addresses = await window.ShopSphereAddressBook.loadAddresses();
    const selected = await window.ShopSphereAddressBook.getSelectedAddress();

    if (!addresses.length) {
        selectedAddressCache = null;
        host.innerHTML = `<div class="text-muted">No saved address found. <a href="addresses.html">Add address</a></div>`;
        listHost.innerHTML = `<div class="address-card"><p class="mb-0 text-muted">No saved addresses yet. <a href="addresses.html">Add address</a></p></div>`;
        return;
    }

    const active = selected || addresses[0];
    selectedAddressCache = active;
    host.innerHTML = getAddressMarkup(active);

    listHost.innerHTML = addresses.map((address) => `
        <article class="address-card ${active.id === address.id ? "active" : ""}">
            <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                    <span class="address-tag">${address.type || "Home"}</span>
                    <h6 class="mt-2 mb-1">${address.fullName}</h6>
                    <div class="text-muted mb-1">${address.phone}</div>
                    <div>${address.line1}, ${address.line2 ? `${address.line2}, ` : ""}${address.city}, ${address.state} - ${address.pincode}</div>
                </div>
                <button class="btn btn-cart btn-sm payment-select-address" data-id="${address.id}" type="button">Use</button>
            </div>
        </article>
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

function getOrderPayload(paymentMethod, paymentStatus, paymentId = "") {
    const authUser = window.ShopSphereAuth && window.ShopSphereAuth.getAuthUser ? window.ShopSphereAuth.getAuthUser() : null;
    const createdAt = Date.now();
    return {
        id: `SS${createdAt}`,
        userEmail: authUser && authUser.email ? authUser.email : "",
        userName: authUser && authUser.name ? authUser.name : "",
        status: "Ordered",
        paymentMethod,
        paymentStatus,
        paymentId,
        total: getPaymentTotal(paymentItemsCache),
        itemCount: paymentItemsCache.reduce((sum, item) => sum + (item.qty || 1), 0),
        items: paymentItemsCache,
        address: selectedAddressCache,
        createdAt,
        timeline: [
            {
                status: "Ordered",
                title: "Order Confirmed",
                text: "Your order was placed successfully.",
                time: createdAt
            }
        ]
    };
}

async function finalizeOrder(paymentMethod, paymentStatus, paymentId = "") {
    const order = getOrderPayload(paymentMethod, paymentStatus, paymentId);
    if (window.ShopSphereOrderBook) {
        await window.ShopSphereOrderBook.saveOrder(order);
    }

    if (sessionStorage.getItem("shopsphere-buy-now")) {
        sessionStorage.removeItem("shopsphere-buy-now");
    } else {
        window.ShopSphereStore.write(window.ShopSphereStore.cartKey, []);
    }

    sessionStorage.setItem("shopsphere-last-order-id", order.id);
    if (window.ShopSphereStoreUI) {
        window.ShopSphereStoreUI.syncStoreBadges();
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById("orderSuccessModal")).show();
}

function validateCheckout() {
    if (!paymentItemsCache.length) {
        window.alert("No items found for payment.");
        return false;
    }

    if (!selectedAddressCache) {
        window.alert("Please select a delivery address.");
        return false;
    }

    const name = document.getElementById("payerName").value.trim();
    const phone = document.getElementById("payerPhone").value.trim();
    if (!name || !phone) {
        window.alert("Please enter name and phone number.");
        return false;
    }

    return true;
}

function openRazorpayCheckout() {
    if (typeof window.Razorpay === "undefined") {
        window.alert("Razorpay checkout could not load. Please try again.");
        return;
    }

    const name = document.getElementById("payerName").value.trim();
    const phone = document.getElementById("payerPhone").value.trim();
    const method = getSelectedPaymentMethod();
    const total = getPaymentTotal(paymentItemsCache);
    const primaryItem = paymentItemsCache[0];

    const options = {
        key: RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "ShopSphere",
        description: `${primaryItem.name}${paymentItemsCache.length > 1 ? ` + ${paymentItemsCache.length - 1} more item(s)` : ""}`,
        image: primaryItem.image,
        handler: async (response) => {
            await finalizeOrder(method, "Paid", response.razorpay_payment_id || "");
        },
        prefill: {
            name,
            contact: phone
        },
        notes: {
            address: selectedAddressCache ? `${selectedAddressCache.line1}, ${selectedAddressCache.city}` : "",
            payment_method: method
        },
        theme: {
            color: "#ff5f74"
        },
        modal: {
            ondismiss: () => {
                sessionStorage.setItem("shopsphere-payment-method", method);
            }
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", () => {
        window.alert("Payment failed. Please try again.");
    });
    razorpay.open();
}

function setupPaymentFlow() {
    document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
        input.addEventListener("change", () => {
            sessionStorage.setItem("shopsphere-payment-method", getSelectedPaymentMethod());
            updatePlaceOrderButton();
        });
    });

    document.getElementById("placeOrderBtn").addEventListener("click", async () => {
        if (!validateCheckout()) {
            return;
        }

        const method = getSelectedPaymentMethod();
        sessionStorage.setItem("shopsphere-payment-method", method);

        if (method === "Cash on Delivery") {
            await finalizeOrder(method, "Cash on Delivery");
            return;
        }

        openRazorpayCheckout();
    });
}

function setupAddressActions() {
    document.addEventListener("click", async (event) => {
        const selectBtn = event.target.closest(".payment-select-address");
        const openTrigger = event.target.closest('[data-bs-target="#wishlistCanvas"]');
        const removeWishlistBtn = event.target.closest(".remove-wishlist-btn");

        if (openTrigger) {
            renderWishlistPanel();
            return;
        }

        if (removeWishlistBtn) {
            window.ShopSphereStore.removeWishlist(removeWishlistBtn.dataset.slug, removeWishlistBtn.dataset.category);
            renderWishlistPanel();
            if (window.ShopSphereStoreUI) {
                window.ShopSphereStoreUI.syncStoreBadges();
            }
            return;
        }

        if (!selectBtn) {
            return;
        }

        await window.ShopSphereAddressBook.selectAddress(selectBtn.dataset.id);
        await renderSelectedAddress();
        bootstrap.Modal.getOrCreateInstance(document.getElementById("paymentAddressModal")).hide();
    });
}

function initPaymentFields() {
    if (selectedAddressCache) {
        document.getElementById("payerName").value = selectedAddressCache.fullName || "";
        document.getElementById("payerPhone").value = selectedAddressCache.phone || "";
    }
}

async function initPaymentPage() {
    renderPayment();
    renderWishlistPanel();
    await renderSelectedAddress();
    initPaymentFields();
    setupPaymentFlow();
    setupAddressActions();
}

initPaymentPage();
