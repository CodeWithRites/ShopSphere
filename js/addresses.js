function renderAddresses(addresses, selectedId) {
    const host = document.getElementById("addressList");
    if (!addresses.length) {
        host.innerHTML = `<div class="address-card"><p class="mb-0 text-muted">No addresses saved yet. Add your first address from the form.</p></div>`;
        return;
    }

    host.innerHTML = addresses.map((address) => `
        <article class="address-card ${address.id === selectedId ? "active" : ""}">
            <div class="d-flex justify-content-between gap-3 align-items-start">
                <div>
                    <span class="address-tag">${address.type || "Home"}</span>
                    <h5 class="mt-2 mb-1">${address.fullName}</h5>
                    <div class="text-muted mb-1">${address.phone}</div>
                    <div>${address.line1}, ${address.line2 ? `${address.line2}, ` : ""}${address.city}, ${address.state} - ${address.pincode}</div>
                </div>
            </div>
            <div class="address-actions">
                <button class="btn btn-ghost btn-sm edit-address-btn" data-id="${address.id}" type="button">Change</button>
                <button class="btn btn-outline-danger btn-sm delete-address-btn" data-id="${address.id}" type="button">Delete</button>
            </div>
        </article>
    `).join("");
}

function fillForm(address) {
    document.getElementById("addressId").value = address.id || "";
    document.getElementById("addressFullName").value = address.fullName || "";
    document.getElementById("addressPhone").value = address.phone || "";
    document.getElementById("addressLine1").value = address.line1 || "";
    document.getElementById("addressLine2").value = address.line2 || "";
    document.getElementById("addressCity").value = address.city || "";
    document.getElementById("addressState").value = address.state || "";
    document.getElementById("addressPincode").value = address.pincode || "";
    document.getElementById("addressType").value = address.type || "Home";
}

async function refreshAddresses() {
    const addresses = await window.ShopSphereAddressBook.loadAddresses();
    const selected = await window.ShopSphereAddressBook.getSelectedAddress();
    renderAddresses(addresses, selected ? selected.id : "");

    document.addEventListener("click", async (event) => {
        const editBtn = event.target.closest(".edit-address-btn");
        const deleteBtn = event.target.closest(".delete-address-btn");
        if (editBtn) {
            const item = addresses.find((address) => address.id === editBtn.dataset.id);
            if (item) {
                fillForm(item);
                bootstrap.Modal.getOrCreateInstance(document.getElementById("addressModal")).show();
            }
        }
        if (deleteBtn) {
            await window.ShopSphereAddressBook.deleteAddress(deleteBtn.dataset.id);
            refreshAddresses();
        }
    }, { once: true });
}

document.getElementById("addressForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const address = {
        id: document.getElementById("addressId").value.trim(),
        fullName: document.getElementById("addressFullName").value.trim(),
        phone: document.getElementById("addressPhone").value.trim(),
        line1: document.getElementById("addressLine1").value.trim(),
        line2: document.getElementById("addressLine2").value.trim(),
        city: document.getElementById("addressCity").value.trim(),
        state: document.getElementById("addressState").value.trim(),
        pincode: document.getElementById("addressPincode").value.trim(),
        type: document.getElementById("addressType").value
    };

    await window.ShopSphereAddressBook.saveAddress(address);
    event.currentTarget.reset();
    document.getElementById("addressId").value = "";
    bootstrap.Modal.getOrCreateInstance(document.getElementById("addressModal")).hide();
    refreshAddresses();
});

refreshAddresses();
