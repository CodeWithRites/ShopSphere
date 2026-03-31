# ShopSphere

ShopSphere is a responsive e-commerce web project built with HTML, CSS, JavaScript, Bootstrap, Firebase, and Razorpay test integration. It includes both a customer storefront and a separate admin panel for managing products, orders, notifications, and user activity.

## Features

### User Side
- Firebase login and registration
- Protected shopping flow
- Browse products by category
- Product details page with size, delivery, wishlist, and share options
- Add to cart and buy now flow
- Address management
- Order history and order timeline
- Admin notifications page
- Wishlist and cart counters in navbar

### Admin Side
- Separate admin dashboard
- Add and manage products across categories
- Update stock, price, rating, and availability
- Track product catalog
- Manage order status: Approved, Shipped, Delivered, Cancelled
- Send notifications to users
- View user visit history

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Firebase Authentication
- Firebase Firestore
- Razorpay Test Checkout
- LocalStorage

## Project Structure

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
