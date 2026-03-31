# 🛍️ ShopSphere

> A modern, responsive e-commerce web project with a complete customer storefront and a powerful admin dashboard.

ShopSphere is built using HTML, CSS, JavaScript, Bootstrap, Firebase, and Razorpay test integration. It provides a smooth shopping experience for users and a separate admin panel to manage products, orders, notifications, and user activity.

---

## ✨ Features

### 👤 User Side

* 🔐 Firebase login and registration
* 🛡️ Protected shopping flow
* 🛒 Browse products by category
* 📦 Product details page with:

  * Size selection
  * Delivery information
  * Wishlist option
  * Share option
* ❤️ Add to wishlist
* 🛍️ Add to cart and Buy Now flow
* 📍 Address management
* 📜 Order history and order timeline
* 🔔 Notifications page for users
* 🔢 Wishlist and cart counters in the navbar

### 🛠️ Admin Side

* 📊 Separate admin dashboard
* ➕ Add and manage products across categories
* 🏷️ Update stock, price, rating, and availability
* 📦 Track the complete product catalog
* 🚚 Manage order status:

  * Approved
  * Shipped
  * Delivered
  * Cancelled
* 📢 Send notifications to users
* 👥 View user visit history

---

## 🚀 Tech Stack

* 🌐 HTML5
* 🎨 CSS3
* ⚡ JavaScript
* 🅱️ Bootstrap 5
* 🔥 Firebase Authentication
* 🗄️ Firebase Firestore
* 💳 Razorpay Test Checkout
* 💾 LocalStorage

---

## Output
<img width="1262" height="836" alt="Screenshot 2026-03-31 120659" src="https://github.com/user-attachments/assets/a82eb440-e31e-4825-bc83-535b18862aa7" />
<img width="1920" height="1080" alt="Screenshot 2026-03-20 134524" src="https://github.com/user-attachments/assets/0b79e94f-46d3-4a5a-b2e4-c068c6008060" />
<img width="1920" height="1080" alt="Screenshot 2026-03-31 120525" src="https://github.com/user-attachments/assets/fe8df945-346d-46aa-95e3-5f2436492b82" />
<img width="1281" height="900" alt="Screenshot 2026-03-31 120541" src="https://github.com/user-attachments/assets/cb273185-b74e-4f44-8fcb-b5e17e4cafa4" />
<img width="1134" height="885" alt="Screenshot 2026-03-31 120600" src="https://github.com/user-attachments/assets/d27524a1-b7f4-403b-a5f5-07aaef69e3b0" />
<img width="1386" height="907" alt="Screenshot 2026-03-31 120619" src="https://github.com/user-attachments/assets/66bf0efe-a8b2-4d97-9094-87560549fe80" />
<img width="1315" height="871" alt="Screenshot 2026-03-31 120641" src="https://github.com/user-attachments/assets/be18272e-b11f-4c7f-829e-cad4d6e34e53" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/03e232a0-b5f1-4f89-b3c7-7fdedd359514" />
<img width="949" height="814" alt="Screenshot 2026-03-31 120721" src="https://github.com/user-attachments/assets/b609423a-efd1-4c3a-b987-6e5fb088af06" />
<img width="1117" height="898" alt="Screenshot 2026-03-31 120741" src="https://github.com/user-attachments/assets/9344f566-75e1-4ec7-b601-a30eeb0d4f66" />


## 📂 Project Structure

```text
ShopSphere/
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── category.html
├── product.html
├── cart.html
├── payment.html
├── orders.html
├── order-details.html
├── account.html
├── profile-details.html
├── addresses.html
├── notifications.html
├── admin.html
├── admin-products.html
├── admin-notifications.html
├── admin-track-products.html
├── admin-orders.html
├── admin-users.html
├── css/
└── js/
```

---

## 📥 How to Clone the Project

1. Open terminal or command prompt
2. Run the following command:

```bash
git clone https://github.com/CodeWithRites/ShopSphere.git
```

3. Move into the project folder:

```bash
cd ShopSphere
```

---

## ▶️ How to Run the Project

### Method 1: Run Directly

1. Open the project folder
2. Double-click `index.html`
3. The project will open in your browser

### Method 2: Using VS Code Live Server

1. Open the project in Visual Studio Code
2. Install the **Live Server** extension
3. Right-click on `index.html`
4. Click **Open with Live Server**
5. The project will run automatically in your browser

---

## 🔥 Firebase Setup

To make login, registration, and database features work:

1. Create a project in Firebase
2. Enable Authentication and Firestore
3. Copy your Firebase configuration
4. Paste the config inside your JavaScript file

Example:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 💳 Razorpay Test Setup

1. Create a Razorpay account
2. Use Razorpay test mode keys
3. Replace the test key in your payment JavaScript file

```javascript
key: "rzp_test_xxxxxxxxxx"
```

---

## 🌟 Future Improvements

* 📱 Fully responsive mobile optimization
* 🌙 Dark mode support
* 🔍 Search and filter products
* ⭐ Product reviews and ratings by users
* 🧾 Invoice download
* 📈 Analytics dashboard for admin

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit and push your code
5. Open a pull request

```bash
git checkout -b feature-name
git commit -m "Added new feature"
git push origin feature-name
```

---

## 📜 License

This project is created for learning and educational purposes.
