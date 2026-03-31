const ADDRESS_CACHE_KEY = "shopsphere-addresses";
const ADDRESS_SELECTED_KEY = "shopsphere-selected-address-id";

function readAddressCache() {
    try {
        return JSON.parse(localStorage.getItem(ADDRESS_CACHE_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeAddressCache(addresses) {
    localStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(addresses));
}

async function getCurrentUid() {
    if (window.ShopSphereFirebase && window.ShopSphereFirebase.getCurrentUser) {
        const user = window.ShopSphereFirebase.getCurrentUser();
        return user ? user.uid : "";
    }
    return "";
}

async function loadAddresses() {
    const uid = await getCurrentUid();
    if (uid && window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        const addresses = await window.ShopSphereFirebase.getAddresses(uid);
        writeAddressCache(addresses);
        return addresses;
    }
    return readAddressCache();
}

async function saveAddress(address) {
    const uid = await getCurrentUid();
    let savedAddress;

    if (uid && window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        savedAddress = await window.ShopSphereFirebase.saveAddress(uid, address);
        const addresses = await window.ShopSphereFirebase.getAddresses(uid);
        writeAddressCache(addresses);
    } else {
        const addresses = readAddressCache();
        const addressId = address.id || `addr_${Date.now()}`;
        savedAddress = { ...address, id: addressId };
        const filtered = addresses.filter((item) => item.id !== addressId);
        filtered.unshift(savedAddress);
        writeAddressCache(filtered);
    }

    localStorage.setItem(ADDRESS_SELECTED_KEY, savedAddress.id);
    return savedAddress;
}

async function selectAddress(addressId) {
    localStorage.setItem(ADDRESS_SELECTED_KEY, addressId);
    const uid = await getCurrentUid();
    if (uid && window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        await window.ShopSphereFirebase.setSelectedAddress(uid, addressId);
    }
}

async function deleteAddress(addressId) {
    const uid = await getCurrentUid();

    if (uid && window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
        await window.ShopSphereFirebase.deleteAddress(uid, addressId);
        const addresses = await window.ShopSphereFirebase.getAddresses(uid);
        writeAddressCache(addresses);
        localStorage.setItem(ADDRESS_SELECTED_KEY, addresses[0] ? addresses[0].id : "");
        return;
    }

    const addresses = readAddressCache().filter((item) => item.id !== addressId);
    writeAddressCache(addresses);
    localStorage.setItem(ADDRESS_SELECTED_KEY, addresses[0] ? addresses[0].id : "");
}

async function getSelectedAddress() {
    const addresses = await loadAddresses();
    const selectedId = localStorage.getItem(ADDRESS_SELECTED_KEY);
    return addresses.find((item) => item.id === selectedId) || addresses[0] || null;
}

window.ShopSphereAddressBook = {
    loadAddresses,
    saveAddress,
    selectAddress,
    deleteAddress,
    getSelectedAddress
};
