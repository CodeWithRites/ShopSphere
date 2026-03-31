(async function initAdminUsers() {
    if (!window.ShopSphereAdmin || !window.ShopSphereAdmin.ensureAdminAccess()) {
        return;
    }

    const tableHost = document.getElementById("adminVisitHistoryTable");
    const activity = window.ShopSphereAdmin.getUserActivityLog().filter((entry) => {
        const email = String(entry.email || "").toLowerCase();
        return email && email !== window.ShopSphereAdmin.getConfiguredAdminEmail();
    });

    if (!activity.length) {
        tableHost.innerHTML = `<div class="admin-empty-state">No user visit history found yet.</div>`;
        return;
    }

    tableHost.innerHTML = `
        <div class="table-responsive">
            <table class="table admin-table align-middle mb-0">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Activity</th>
                        <th>Page</th>
                        <th>Visit Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${activity.map((entry) => `
                        <tr>
                            <td><strong>${entry.name || "ShopSphere User"}</strong></td>
                            <td>${entry.email || "-"}</td>
                            <td><span class="admin-status admin-status--approved">${entry.type || "login"}</span></td>
                            <td>${entry.page || "-"}</td>
                            <td>${window.ShopSphereAdmin.formatDateTime(entry.time)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
})();
