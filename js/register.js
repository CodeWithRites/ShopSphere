const registerForm = document.getElementById("registerForm");
const socialLoginButtons = document.querySelectorAll(".social-login-btn");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();

    if (!name || !email || !password || !confirmPassword) {
        window.alert("Please fill all register fields.");
        return;
    }

    if (password !== confirmPassword) {
        window.alert("Passwords do not match.");
        return;
    }

    try {
        if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
            await window.ShopSphereFirebase.register(name, email, password);
            if (window.ShopSphereFirebase.signOut) {
                await window.ShopSphereFirebase.signOut();
            }
        }
        window.ShopSphereAuth.clearAuthUser();
        window.ShopSphereAuth.syncAuthUI();
        window.alert(window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured ? "Registration successful. Please login now." : "Registration successful. Please login now.");
        window.location.href = "login.html";
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
            await window.ShopSphereFirebase.signInWithGoogle();
            if (window.ShopSphereFirebase.signOut) {
                await window.ShopSphereFirebase.signOut();
            }
            window.ShopSphereAuth.clearAuthUser();
            window.ShopSphereAuth.syncAuthUI();
            window.alert("Google account linked successfully. Please login now.");
            window.location.href = "login.html";
        } catch (error) {
            window.alert(mapFirebaseAuthError(error));
        }
    });
});
