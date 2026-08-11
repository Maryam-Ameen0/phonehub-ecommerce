# 📱 PhoneHub — Buy & Sell Mobile Phones

PhoneHub is a full-stack e-commerce marketplace built specifically for buying and selling mobile phones. It's not just a store — it works like a small version of eBay: the store itself sells phones, **and** everyday users can list their own phones for sale, with an admin reviewing every listing before it goes live.

This project was built end-to-end: database design, backend API, frontend interface, and an admin dashboard — all working together as one real application.

---

## ✨ What This Project Can Do

### For Customers
- Create an account and log in securely
- Browse phones with search, filters (category, brand, condition, price), and sorting
- View detailed product pages with specs (storage, RAM, color, condition)
- Add items to a cart or a wishlist
- Checkout and place orders (Cash on Delivery)
- View order history and track order status
- List their own phone for sale, with a photo — pending admin approval

### For Admins
- A dedicated **Admin Panel** with:
  - **Dashboard** — real sales analytics: revenue chart, order breakdown, best-selling products
  - **Listing Approvals** — approve or reject phones submitted by users, with an optional reason
  - **Products** — add, edit, or delete any product, including uploading a photo
  - **Orders** — view every order and update its status (processing, shipped, delivered, etc.)
  - **Users** — view all registered users and remove accounts if needed

---

## 🛠️ Built With

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Styling | Custom CSS design system (no framework) |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens), bcrypt password hashing |
| File uploads | Multer (product photos) |
| Charts | Recharts (admin analytics) |

---

## 🚀 Getting Started

### 1. Set up the database
Run these against your local MySQL, in order:
```
mysql -u root -p < Backend/database/schema.sql
mysql -u root -p ecommerce_store < Backend/database/migration_phase3.sql
mysql -u root -p ecommerce_store < Backend/database/migration_phase6.sql
```

### 2. Configure the backend
```
cd Backend
cp .env.example .env
```
Open `.env` and set your MySQL password. Everything else can stay as-is.

### 3. Install dependencies
```
cd Backend && npm install
cd ../frontend && npm install
```

### 4. Run the project
```
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```
Open the link Vite prints (usually `http://localhost:5173`).

**Default admin login:** `admin@store.com` / `Admin@123`

### 5. Testing on a phone (same WiFi)
```
cd frontend && npm run dev -- --host
```
Use the "Network" address Vite prints instead of localhost.

### 6. Sharing with someone on a different network
See the "Letting someone on a different network test it" section below — this uses a free tool called ngrok to generate a temporary public link.

---

## 📁 Project Structure

```
Backend/
  config/db.js          Database connection
  controllers/          Business logic for each feature
  routes/                API endpoints
  middleware/            Login checks, admin checks, file uploads
  database/              Schema and migration files
  uploads/                Product photos (created automatically)

frontend/
  src/
    pages/                Every screen in the app
    pages/admin/          Admin Panel screens
    components/            Reusable UI pieces (Navbar, ProductCard, etc.)
    context/                App-wide state (login, cart, wishlist)
    services/api.js         Handles all requests to the backend
    styles/tokens.css        Colors, fonts, and spacing used everywhere
```

---

## 🌐 Letting Someone on a Different Network Test It

A phone on your own WiFi can reach your computer directly. Someone on a different network (different WiFi, different city) cannot — for that, you need a tunnel:

1. Install [ngrok](https://ngrok.com) (free account is enough).
2. Run the backend and frontend normally.
3. Open two more terminals:
   ```
   ngrok http 5000
   ngrok http 5173
   ```
4. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the address the **backend** tunnel gave you.
5. Restart the frontend so it picks up the change.
6. Share the **frontend** tunnel address — that's the link the other person opens.

*(Free ngrok links change every time you restart them, so this is best for occasional testing, not a permanent link.)*

---

## ✅ What's Been Tested

Every backend feature was tested against a real, running database before being considered done — including login/signup, cart and stock limits, the full checkout process, the complete "list a phone → admin approves it → it appears in the shop" flow, and all the admin actions. The interface was also checked on both desktop and mobile screen sizes to make sure nothing breaks or overflows on a smaller screen.

---

## 🔧 Possible Future Improvements

- Real payment gateway (currently Cash on Delivery only)
- Email notifications for orders and listing approvals
- Password reset
- Multiple photos per listing
- Pagination controls on the shop page for very large catalogs

---

## 👩‍💻 Author

Built by **Maryam** as a full-stack learning project.
