(function initAdminNotifications() {
    if (!window.ShopSphereAdmin || !window.ShopSphereAdmin.ensureAdminAccess()) {
        return;
    }

    const form = document.getElementById("adminNotificationForm");
    const list = document.getElementById("adminNotificationList");

    function renderNotifications() {
        const notifications = window.ShopSphereAdmin.readAdminNotifications();
        list.innerHTML = notifications.length ? notifications.map((item) => `
            <div class="admin-list-item">
                <div class="admin-list-item__top">
                    <div>
                        <strong>${item.title}</strong>
                        <p>${item.type} • ${window.ShopSphereAdmin.formatDateTime(item.createdAt)}</p>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="admin-status admin-status--approved">${item.cta}</span>
                        <button class="btn admin-delete-btn" type="button" data-notification-id="${item.id}">Delete</button>
                    </div>
                </div>
                <p>${item.message}</p>
            </div>
        `).join("") : `<div class="admin-empty-state">No notifications published yet.</div>`;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.getElementById("notificationTitle").value.trim();
        const message = document.getElementById("notificationMessage").value.trim();
        const type = document.getElementById("notificationType").value;
        const cta = document.getElementById("notificationCta").value.trim();

        if (!title || !message || !cta) {
            window.alert("Please fill all notification fields.");
            return;
        }

        window.ShopSphereAdmin.saveAdminNotification({
            title,
            message,
            type,
            cta
        });

        form.reset();
        renderNotifications();
        window.alert("Notification sent successfully.");
    });

    list.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-notification-id]");
        if (!deleteButton) {
            return;
        }

        window.ShopSphereAdmin.deleteAdminNotification(deleteButton.dataset.notificationId);
        renderNotifications();
    });

    renderNotifications();
})();
