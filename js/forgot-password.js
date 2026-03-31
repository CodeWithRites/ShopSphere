const forgotPasswordForm = document.getElementById("forgotPasswordForm");

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    if (!email) {
        window.alert("Please enter your email address.");
        return;
    }

    try {
        if (window.ShopSphereFirebase && window.ShopSphereFirebase.isConfigured) {
            await window.ShopSphereFirebase.sendPasswordReset(email);
            window.alert("Firebase password reset link sent.");
        } else {
            window.alert("Password reset link sent to your email.");
        }
        window.location.href = "login.html";
    } catch (error) {
        window.alert(mapFirebaseAuthError(error));
    }
});
