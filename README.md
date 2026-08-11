# PhoneHub — E-Commerce Store (Buy & Sell Mobile Phones)

A full-stack marketplace built with **React + Vite** (frontend), **Node.js + Express** (backend), and **MySQL**. Customers can browse, buy, and also list their own phones for sale; admins moderate listings and run the store from an admin panel.

---

## 1. What this project includes

- **Auth** — register/login, JWT sessions, bcrypt password hashing
- **Catalog** — browse, search, filter (category/brand/condition/price), sort, product detail pages
- **Cart & Wishlist**
- **Checkout & Orders** — Cash on Delivery, order history, order detail
- **Sell a Phone** — any logged-in user can list a phone for sale, with a photo, pending admin approval
- **Admin Panel** — listing approvals (approve/reject with reason), full product CRUD (add/edit/delete + photo), order management (status updates), user management, and a real analytics dashboard (revenue chart, order breakdown, top products)
- Responsive, mobile-tested design throughout (eBay-inspired theme — navy/blue with spec-chip badges for condition/storage/color)

---

## 2. One-time setup

### 2.1 Create the database
Open MySQL Workbench (or a terminal) and run, **in this order**:
```
mysql -u root -p < Backend/database/schema.sql
mysql -u root -p ecommerce_store < Backend/database/migration_phase3.sql
mysql -u root -p ecommerce_store < Backend/database/migration_phase6.sql
```
`schema.sql` creates the database and all tables (with seed categories/products/admin account already phone-specific). The two migration files add the phone-specific product fields and the marketplace/seller fields — they exist because those features were added after the base schema, but running all three in order gets you the complete, current database.

> If you already ran `schema.sql` in an earlier session and only need what's new, you can just run whichever migration file(s) you haven't run yet — check `Backend/database/` for what's there.

### 2.2 Backend environment
```
cd Backend
cp .env.example .env
```
Open `.env` and set your real MySQL password. Everything else can stay as-is for local development.

### 2.3 Install dependencies
```
cd Backend && npm install
cd ../frontend && npm install
```

### 2.4 Run it
```
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

**Default admin login:** `admin@store.com` / `Admin@123`

### 2.5 Testing on your phone (same WiFi)
```
cd frontend && npm run dev -- --host
```
Vite will print a "Network" URL (something like `http://192.168.x.x:5173`) — open that on your phone. The app automatically points itself at your computer's IP for the backend too, no extra config needed.

**If it loads but login/products don't work:** your computer's firewall is likely blocking the connection. On Windows, open "Windows Defender Firewall with Advanced Security" → Inbound Rules → New Rule → Port → TCP → specific ports `5000,5173` → Allow the connection → tick Private → finish. Restart both servers after.

### 2.6 Letting someone on a different network test it
A LAN IP only works for devices on your own WiFi. For someone elsewhere, use a tunnel:

1. Install [ngrok](https://ngrok.com) and sign up (free tier is fine).
2. Run your backend and frontend as normal (`npm run dev` in each).
3. In two more terminals, run:
   ```
   ngrok http 5000    # backend tunnel — copy the https URL it gives you
   ngrok http 5173    # frontend tunnel — this is the link you share
   ```
4. Copy `frontend/.env.example` to `frontend/.env` and set:
   ```
   VITE_API_URL=https://<your-backend-ngrok-url>
   ```
   (the URL from step 3's backend tunnel, no trailing slash)
5. Restart the frontend (`npm run dev`) so it picks up the new `.env`.
6. Share the **frontend** ngrok URL — that's what the other person opens.

Free ngrok URLs change every time you restart the tunnel, so you'll redo steps 3–5 each session. For something permanent, you'd want a real deployment instead (ask if you want help with that).

---

## 3. Project structure

```
Backend/
  config/db.js              MySQL connection
  controllers/              Route logic (auth, products, cart, wishlist, orders, listings, admin/*)
  routes/                   Express routes, mirrors controllers
  middleware/                JWT auth, admin-only guard, image upload (multer)
  database/
    schema.sql               Full schema + seed data (fresh installs)
    migration_phase3.sql      Adds phone-specific product fields + categories
    migration_phase6.sql      Adds seller_id / approval_status (marketplace)
  uploads/                    Product photos (created automatically)
  server.js                  App entry point

frontend/
  src/
    pages/                   One file per page (Shop, ProductDetail, Cart, Checkout, Sell, admin/*, ...)
    pages/admin/             Admin Panel: Dashboard, Listings, Products, Orders, Users
    components/               Navbar, ProductCard, FilterSidebar, AdminLayout, etc.
    context/                  AuthContext, CartContext, WishlistContext (global state)
    services/api.js           Axios instance (auto-attaches login token)
    config.js                  API URL — auto-adapts to localhost or LAN IP
    styles/tokens.css          Design system: colors, fonts, spacing
```

---

## 4. How the pieces fit together

- **Design system**: `frontend/src/styles/tokens.css` holds every color/font/spacing value used across the app — change it there once, it updates everywhere.
- **Auth**: `AuthContext` holds the logged-in user and token (persisted in localStorage); `services/api.js` attaches the token to every request automatically.
- **Marketplace flow**: any user submits a listing via `/sell` → it's `pending` → hidden from the shop → admin approves/rejects it in the Admin Panel → approved listings appear in the shop with "Sold by [name]".
- **Images**: uploaded via the `Sell` and admin `Add/Edit Product` forms, stored in `Backend/uploads/`, served at `/uploads/<filename>`. The frontend resolves these through `frontend/src/config.js`, which points at whatever host the page itself was loaded from (localhost or your LAN IP) — so it works the same on desktop and phone without editing anything.

---

## 5. What's been tested

Every backend endpoint was tested against a real running database before being handed over — not just written and assumed to work. That includes: full auth flow, cart/wishlist stock checks, checkout as an atomic transaction (stock decrement + order creation + cart clear all-or-nothing), the complete listing → moderation → approval loop with real image uploads, admin order/user/product management, and role-based access control (customers blocked from admin routes, users blocked from each other's orders, etc.).

The frontend was also checked with a real headless browser at both desktop and mobile (390px) widths across every page — not just visually, but by measuring actual page width to catch horizontal-overflow bugs. Two real issues were found and fixed this way: the shop's filter sidebar burying products on mobile (now a collapsible toggle), and the admin panel overflowing sideways on phones (a CSS grid sizing bug). Both were re-verified after the fix.

## 6. Known limitations / things you may want to add later
- Payment is Cash-on-Delivery only (as requested) — no real payment gateway
- No email notifications (order confirmation, approval/rejection emails, etc.)
- No password-reset flow
- Product images are single-photo only (no gallery/multiple photos per listing)
- No pagination controls in the UI yet for very large catalogs (backend supports it, frontend doesn't expose page controls)

If you want any of these, just ask and I'll build it the same way as everything else here — tested before it's handed over.
