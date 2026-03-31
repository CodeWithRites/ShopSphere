(function initializeShopSphereFirebase() {
    const defaultApi = {
        isReady: false,
        isConfigured: false,
        async signIn() {
            return null;
        },
        async register() {
            return null;
        },
        async sendPasswordReset() {
            return null;
        },
        async signOut() {
            return null;
        }
    };

    function hasRealFirebaseConfig(config) {
        if (!config) {
            return false;
        }

        return Object.values(config).every((value) => typeof value === "string" && value && !value.startsWith("YOUR_"));
    }

    if (!window.firebase || !window.ShopSphereFirebaseConfig || !hasRealFirebaseConfig(window.ShopSphereFirebaseConfig)) {
        window.ShopSphereFirebase = defaultApi;
        return;
    }

    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.ShopSphereFirebaseConfig);
    const auth = firebase.auth(app);
    const db = firebase.firestore ? firebase.firestore(app) : null;

    async function upsertUserDocument(user, provider = "password") {
        if (!db || !user) {
            return null;
        }

        const userRef = db.collection("users").doc(user.uid);
        const payload = {
            uid: user.uid,
            name: user.displayName || (user.email ? user.email.split("@")[0] : "ShopSphere User"),
            email: user.email || "",
            provider,
            photoURL: user.photoURL || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const snapshot = await userRef.get();
        if (!snapshot.exists) {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }

        await userRef.set(payload, { merge: true });
        return payload;
    }

    async function getUserDoc(uid) {
        if (!db || !uid) {
            return null;
        }
        const snapshot = await db.collection("users").doc(uid).get();
        return snapshot.exists ? snapshot.data() : null;
    }

    function buildTimelineStep(status, paymentMethod, time = Date.now()) {
        const normalized = String(status || "Ordered").toLowerCase();
        const map = {
            ordered: {
                title: "Order Confirmed",
                text: "Your order was placed successfully."
            },
            approved: {
                title: "Approved",
                text: "Admin approved your order and started processing it."
            },
            shipped: {
                title: "Shipped",
                text: "Your order has been shipped and is on the way."
            },
            delivered: {
                title: "Delivered",
                text: "Your order has been delivered successfully."
            },
            cancelled: {
                title: "Cancelled",
                text: "This order was cancelled by admin."
            }
        };

        const selected = map[normalized] || {
            title: status || "Order Update",
            text: paymentMethod ? `Payment method: ${paymentMethod}` : "Your order update is available here."
        };

        return {
            status: status || "Ordered",
            title: selected.title,
            text: selected.text,
            time
        };
    }

    window.ShopSphereFirebase = {
        isReady: true,
        isConfigured: true,
        getCurrentUser() {
            return auth.currentUser;
        },
        onAuthStateChanged(callback) {
            return auth.onAuthStateChanged(callback);
        },
        async signIn(email, password) {
            const credential = await auth.signInWithEmailAndPassword(email, password);
            await upsertUserDocument(credential.user, "password");
            return credential.user;
        },
        async register(name, email, password) {
            const credential = await auth.createUserWithEmailAndPassword(email, password);
            if (name) {
                await credential.user.updateProfile({ displayName: name });
            }
            await upsertUserDocument(auth.currentUser || credential.user, "password");
            return credential.user;
        },
        async signInWithGoogle() {
            const provider = new firebase.auth.GoogleAuthProvider();
            const credential = await auth.signInWithPopup(provider);
            await upsertUserDocument(credential.user, "google");
            return credential.user;
        },
        async sendPasswordReset(email) {
            await auth.sendPasswordResetEmail(email);
        },
        async signOut() {
            await auth.signOut();
        },
        async getUserProfile(uid) {
            return getUserDoc(uid);
        },
        async updateUserProfile(uid, profileData) {
            if (!db || !uid || !profileData) {
                return null;
            }

            const userRef = db.collection("users").doc(uid);
            const payload = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (typeof profileData.name === "string") {
                payload.name = profileData.name;
            }

            if (typeof profileData.email === "string") {
                payload.email = profileData.email;
            }

            if (typeof profileData.phone === "string") {
                payload.phone = profileData.phone;
            }

            if (typeof profileData.gender === "string") {
                payload.gender = profileData.gender;
            }

            await userRef.set(payload, { merge: true });
            return payload;
        },
        async getAddresses(uid) {
            const profile = await getUserDoc(uid);
            return profile && Array.isArray(profile.addresses) ? profile.addresses : [];
        },
        async saveAddress(uid, address) {
            if (!db || !uid || !address) {
                return null;
            }
            const userRef = db.collection("users").doc(uid);
            const profile = await getUserDoc(uid);
            const addresses = profile && Array.isArray(profile.addresses) ? profile.addresses : [];
            const addressId = address.id || `addr_${Date.now()}`;
            const nextAddress = {
                id: addressId,
                fullName: address.fullName || "",
                phone: address.phone || "",
                line1: address.line1 || "",
                line2: address.line2 || "",
                city: address.city || "",
                state: address.state || "",
                pincode: address.pincode || "",
                type: address.type || "Home",
                updatedAt: Date.now()
            };
            const filtered = addresses.filter((item) => item.id !== addressId);
            filtered.unshift(nextAddress);
            await userRef.set({
                addresses: filtered,
                selectedAddressId: addressId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return nextAddress;
        },
        async setSelectedAddress(uid, addressId) {
            if (!db || !uid || !addressId) {
                return;
            }
            await db.collection("users").doc(uid).set({
                selectedAddressId: addressId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        },
        async deleteAddress(uid, addressId) {
            if (!db || !uid || !addressId) {
                return;
            }
            const userRef = db.collection("users").doc(uid);
            const profile = await getUserDoc(uid);
            const addresses = profile && Array.isArray(profile.addresses) ? profile.addresses : [];
            const filtered = addresses.filter((item) => item.id !== addressId);
            const nextSelected = filtered[0] ? filtered[0].id : "";
            await userRef.set({
                addresses: filtered,
                selectedAddressId: nextSelected,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        },
        async getOrders(uid) {
            const profile = await getUserDoc(uid);
            return profile && Array.isArray(profile.orders) ? profile.orders : [];
        },
        async getAllOrders() {
            if (!db) {
                return [];
            }
            const snapshot = await db.collection("orders").get();
            return snapshot.docs.map((doc) => doc.data()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        },
        async listUsers() {
            if (!db) {
                return [];
            }
            const snapshot = await db.collection("users").get();
            return snapshot.docs.map((doc) => doc.data());
        },
        async saveOrder(uid, order) {
            if (!db || !uid || !order) {
                return null;
            }

            const userRef = db.collection("users").doc(uid);
            const profile = await getUserDoc(uid);
            const orders = profile && Array.isArray(profile.orders) ? profile.orders : [];
            const orderId = order.id || `order_${Date.now()}`;
            const nextOrder = {
                id: orderId,
                userUid: uid,
                userEmail: order.userEmail || "",
                userName: order.userName || "",
                status: order.status || "Ordered",
                paymentMethod: order.paymentMethod || "",
                paymentStatus: order.paymentStatus || "",
                paymentId: order.paymentId || "",
                total: Number(order.total || 0),
                itemCount: Number(order.itemCount || 0),
                items: Array.isArray(order.items) ? order.items : [],
                address: order.address || null,
                createdAt: order.createdAt || Date.now(),
                timeline: Array.isArray(order.timeline) && order.timeline.length ? order.timeline : [buildTimelineStep(order.status || "Ordered", order.paymentMethod, order.createdAt || Date.now())]
            };

            orders.unshift(nextOrder);
            await userRef.set({
                orders,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            await db.collection("orders").doc(orderId).set(nextOrder, { merge: true });
            return nextOrder;
        },
        async updateOrder(orderId, updates) {
            if (!db || !orderId || !updates) {
                return null;
            }

            const orderRef = db.collection("orders").doc(orderId);
            const orderSnap = await orderRef.get();
            if (!orderSnap.exists) {
                return null;
            }

            const currentOrder = orderSnap.data();
            const currentTimeline = Array.isArray(currentOrder.timeline) && currentOrder.timeline.length
                ? [...currentOrder.timeline]
                : [buildTimelineStep(currentOrder.status || "Ordered", currentOrder.paymentMethod, currentOrder.createdAt || Date.now())];
            const nextTimeline = updates.status && updates.status !== currentOrder.status
                ? [...currentTimeline, buildTimelineStep(updates.status, currentOrder.paymentMethod, Date.now())]
                : currentTimeline;
            const nextOrder = {
                ...currentOrder,
                ...updates,
                timeline: Array.isArray(updates.timeline) ? updates.timeline : nextTimeline,
                updatedAt: Date.now()
            };

            await orderRef.set(nextOrder, { merge: true });

            if (currentOrder.userUid) {
                const userRef = db.collection("users").doc(currentOrder.userUid);
                const profile = await getUserDoc(currentOrder.userUid);
                const orders = profile && Array.isArray(profile.orders) ? profile.orders : [];
                const nextOrders = orders.map((order) => order.id === orderId ? { ...order, ...updates, updatedAt: Date.now() } : order);
                await userRef.set({
                    orders: nextOrders,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }

            return nextOrder;
        }
    };
})();
