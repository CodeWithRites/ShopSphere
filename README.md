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

## Output
<img width="1117" height="898" alt="Screenshot 2026-03-31 120741" src="https://github.com/user-attachments/assets/21cdbcc4-0f06-4ab3-bce1-60a09bb10c1a" />

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
