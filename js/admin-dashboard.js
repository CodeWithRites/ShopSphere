(async function initAdminDashboard() {
    if (!window.ShopSphereAdmin || !window.ShopSphereAdmin.ensureAdminAccess()) {
        return;
    }

    const statsGrid = document.getElementById("adminStatsGrid");
    const orderStatusChart = document.getElementById("orderStatusChart");
    const categoryChart = document.getElementById("categoryChart");
    const stockChart = document.getElementById("stockChart");
    const paymentChart = document.getElementById("paymentChart");

    const orders = await window.ShopSphereAdmin.loadAdminOrders();
    const products = window.ShopSphereAdmin.flattenCatalog();
    const users = await window.ShopSphereAdmin.loadAdminUsers();
    const stats = window.ShopSphereAdmin.calculateDashboardStats(orders, products, users);

    statsGrid.innerHTML = [
        { label: "Total Orders", value: stats.totalOrders, text: "All customer orders placed" },
        { label: "Total Income", value: window.ShopSphereAdmin.formatPrice(stats.totalIncome), text: "Combined order revenue" },
        { label: "Delivered Orders", value: stats.deliveredOrders, text: "Successfully completed orders" },
        { label: "Total Products", value: stats.totalProducts, text: "Live items in the catalog" }
    ].map((item) => `
        <article class="admin-stat-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <p>${item.text}</p>
        </article>
    `).join("");

    function renderPieChart(target, heading, segments) {
        if (!target) {
            return;
        }

        const safeSegments = segments.filter((item) => item.value > 0);
        const total = safeSegments.reduce((sum, item) => sum + item.value, 0);

        if (!total) {
            target.innerHTML = `<div class="admin-empty-state">No chart data available yet.</div>`;
            return;
        }

        let currentAngle = 0;
        const stops = safeSegments.map((item) => {
            const nextAngle = currentAngle + (item.value / total) * 360;
            const stop = `${item.color} ${currentAngle}deg ${nextAngle}deg`;
            currentAngle = nextAngle;
            return stop;
        });

        target.innerHTML = `
            <div class="admin-chart-shell">
                <div class="admin-pie-chart" style="--chart-gradient: ${stops.join(", ")};">
                    <div class="admin-pie-chart__label">
                        <div>${total}<span>${heading}</span></div>
                    </div>
                </div>
                <div class="admin-chart-legend">
                    ${safeSegments.map((item) => `
                        <div class="admin-chart-legend__item">
                            <div class="admin-chart-legend__label">
                                <span class="admin-chart-dot" style="background:${item.color};"></span>
                                <span>${item.label}</span>
                            </div>
                            <strong>${item.value}</strong>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    const orderStatusCounts = ["Ordered", "Approved", "Shipped", "Delivered", "Cancelled"].map((status, index) => ({
        label: status,
        value: orders.filter((order) => String(order.status || "Ordered").toLowerCase() === status.toLowerCase()).length,
        color: ["#3b82f6", "#f59e0b", "#7c3aed", "#16a34a", "#ef4444"][index]
    }));

    const categoryCounts = Object.entries(products.reduce((acc, product) => {
        acc[product.categoryKey] = (acc[product.categoryKey] || 0) + 1;
        return acc;
    }, {})).map(([label, value], index) => ({
        label,
        value,
        color: ["#ff5b6e", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"][index % 5]
    }));

    const stockCounts = [
        {
            label: "In Stock",
            value: products.filter((product) => product.inStock !== false && Number(product.stock || 0) > 0).length,
            color: "#16a34a"
        },
        {
            label: "Low Stock",
            value: products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5).length,
            color: "#f59e0b"
        },
        {
            label: "Out of Stock",
            value: products.filter((product) => product.inStock === false || Number(product.stock || 0) <= 0).length,
            color: "#ef4444"
        }
    ];

    const paymentCounts = Object.entries(orders.reduce((acc, order) => {
        const key = order.paymentMethod || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {})).map(([label, value], index) => ({
        label,
        value,
        color: ["#2563eb", "#ff5b6e", "#16a34a", "#8b5cf6", "#f59e0b"][index % 5]
    }));

    renderPieChart(orderStatusChart, "Orders", orderStatusCounts);
    renderPieChart(categoryChart, "Products", categoryCounts);
    renderPieChart(stockChart, "Stock", stockCounts);
    renderPieChart(paymentChart, "Payments", paymentCounts);
})();
