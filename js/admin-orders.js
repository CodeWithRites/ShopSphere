(async function initAdminOrders() {
    if (!window.ShopSphereAdmin || !window.ShopSphereAdmin.ensureAdminAccess()) {
        return;
    }

    const list = document.getElementById("adminOrdersList");

    async function renderOrders() {
        const orders = await window.ShopSphereAdmin.loadAdminOrders();

        list.innerHTML = orders.length ? orders.map((order) => `
            <div class="admin-list-item">
                <div class="admin-list-item__top">
                    <div>
                        <strong>${order.items && order.items[0] ? order.items[0].name : "Order Item"}</strong>
                        <p>${order.userEmail || "Unknown email"} • ${window.ShopSphereAdmin.formatDateTime(order.createdAt)}</p>
                    </div>
                    <span class="admin-status ${window.ShopSphereAdmin.getStatusClass(order.status)}">${order.status || "Ordered"}</span>
                </div>
                <p>Total ${window.ShopSphereAdmin.formatPrice(order.total || 0)} • Payment ${order.paymentMethod || "NA"}</p>
                <div class="admin-action-grid">
                    <select class="form-select order-status-select">
                        <option value="Approved" ${order.status === "Approved" ? "selected" : ""}>Approved</option>
                        <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                        <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                    </select>
                    <button class="btn admin-primary-btn" type="button">Update Order</button>
                </div>
            </div>
        `).join("") : `<div class="admin-empty-state">No orders found yet.</div>`;

        [...list.querySelectorAll(".admin-list-item")].forEach((card, index) => {
            const order = orders[index];
            const select = card.querySelector(".order-status-select");
            const button = card.querySelector("button");

            button.addEventListener("click", async () => {
                await window.ShopSphereAdmin.updateAdminOrder(order.id, {
                    status: select.value
                });
                renderOrders();
                window.alert("Order status updated.");
            });
        });
    }

    await renderOrders();
})();
