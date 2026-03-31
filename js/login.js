const loginForm = document.getElementById("loginForm");
const socialLoginButtons = document.querySelectorAll(".social-login-btn");

function normalizeName(rawName, email) {
    if (rawName && rawName.trim()) {
        return rawName;
    }

    const fallback = (email || "Profile").split("@")[0].replace(/[._-]/g, " ");
    return fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

function completeAuth(userData, successMessage) {
    const adminEmail = window.ShopSphereAdminConfig && window.ShopSphereAdminConfig.email ? window.ShopSphereAdminConfig.email.toLowerCase() : "admin@shopsphere.com";
    const role = userData.email && userData.email.toLowerCase() === adminEmail ? "admin" : "user";

    window.ShopSphereAuth.setAuthUser({ ...userData, role });
    window.ShopSphereAuth.syncAuthUI();
    if (window.ShopSphereAuth.recordActivity) {
        window.ShopSphereAuth.recordActivity({
            type: "login",
            name: userData.name,
            email: userData.email
        });
    }
    window.alert(successMessage);
    const redirectKey = window.ShopSphereAuthGuard ? window.ShopSphereAuthGuard.redirectKey : "shopsphere-auth-redirect";
    const redirectUrl = sessionStorage.getItem(redirectKey) || (role === "admin" ? "admin.html" : "index.html");
    sessionStorage.removeItem(redirectKey);
    window.location.href = redirectUrl;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        window.alert("Please enter email and password.");
        return;
    }

    try {
        let userData;

        if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
            const user = await window.ShopSphereFirebase.signIn(email, password);
            userData = {
                name: normalizeName(user.displayName, user.email || email),
                email: user.email || email
            };
        } else {
            userData = {
                name: normalizeName("", email),
                email
            };
        }

        completeAuth(userData, window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured ? "Firebase login successful." : "Login successful demo.");
    } catch (error) {
        window.alert(mapFirebaseAuthError(error));
    }
});

socialLoginButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const provider = button.dataset.provider;

        if (!window.ShopSphereFirebase || !window.ShopSphereFirebase.isConfigured) {
            window.alert(`${provider} login requires Firebase configuration.`);
            return;
        }

        try {
            const user = await window.ShopSphereFirebase.signInWithGoogle();

            completeAuth({
                name: normalizeName(user.displayName, user.email || ""),
                email: user.email || ""
            }, "Google login successful.");
        } catch (error) {
            window.alert(mapFirebaseAuthError(error));
        }
    });
});
