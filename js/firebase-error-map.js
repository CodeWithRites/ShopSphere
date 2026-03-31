function mapFirebaseAuthError(error) {
    const code = error && error.code ? error.code : "";

    const knownErrors = {
        "auth/unauthorized-domain": "This domain is not authorized in Firebase. Add `127.0.0.1` and `localhost` in Firebase Console > Authentication > Settings > Authorized domains.",
        "auth/invalid-credential": "Email or password is incorrect, or the account does not exist yet.",
        "auth/user-not-found": "No account found with this email address.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/email-already-in-use": "This email is already registered. Please login instead.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
        "auth/popup-closed-by-user": "Login popup was closed before completing sign-in.",
        "auth/account-exists-with-different-credential": "An account already exists with the same email using another sign-in method.",
        "auth/operation-not-allowed": "This sign-in provider is not enabled in Firebase Console."
    };

    return knownErrors[code] || (error && error.message) || "Something went wrong. Please try again.";
}
