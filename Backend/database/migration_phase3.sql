-- ============================================================
-- Phase 3 migration — run this AFTER schema.sql (Phase 1).
-- Adds phone-specific columns to products, replaces the generic
-- starter categories with phone-relevant ones, and seeds sample
-- products so the catalog isn't empty.
--
-- Run with: mysql -u root -p ecommerce_store < migration_phase3.sql
-- (or open in MySQL Workbench against the ecommerce_store database)
-- ============================================================

USE ecommerce_store;

-- ---------- Add phone-specific columns to products ----------
ALTER TABLE products
    ADD COLUMN brand VARCHAR(50) AFTER name,
    ADD COLUMN storage VARCHAR(20) AFTER brand,
    ADD COLUMN ram VARCHAR(20) AFTER storage,
    ADD COLUMN color VARCHAR(30) AFTER ram,
    ADD COLUMN condition_status ENUM('New', 'Used', 'Refurbished') NOT NULL DEFAULT 'New' AFTER color;

-- ---------- Replace generic categories with phone-relevant ones ----------
DELETE FROM categories WHERE slug IN ('electronics', 'clothing', 'home-living', 'accessories');

INSERT INTO categories (name, slug) VALUES
    ('Smartphones', 'smartphones'),
    ('Tablets', 'tablets'),
    ('Smartwatches', 'smartwatches'),
    ('Phone Accessories', 'phone-accessories')
ON DUPLICATE KEY UPDATE name = name;

-- ---------- Seed sample products ----------
-- image_url is left NULL on purpose — the frontend shows a placeholder
-- graphic until you add real product photos.
INSERT INTO products (name, brand, storage, ram, color, condition_status, description, price, stock, category_id, image_url)
SELECT 'iPhone 15 Pro', 'Apple', '256GB', '8GB', 'Space Black', 'New',
       'Apple''s flagship with A17 Pro chip, titanium frame, and a 48MP main camera.',
       349999, 12, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'iPhone 13', 'Apple', '128GB', '4GB', 'Midnight', 'Used',
       'Reliable and compact, great battery life, minor cosmetic wear on the back.',
       149999, 8, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'Samsung Galaxy S24 Ultra', 'Samsung', '512GB', '12GB', 'Titanium Gray', 'New',
       '200MP camera, S Pen included, 6.8" Dynamic AMOLED display.',
       389999, 6, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'Samsung Galaxy A54', 'Samsung', '128GB', '8GB', 'Awesome Violet', 'New',
       'Mid-range all-rounder with a 120Hz display and solid battery life.',
       84999, 20, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'Google Pixel 8', 'Google', '128GB', '8GB', 'Obsidian', 'Refurbished',
       'Certified refurbished, factory reset, includes Google AI camera features.',
       119999, 5, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'OnePlus 12', 'OnePlus', '256GB', '16GB', 'Flowy Emerald', 'New',
       'Snappy performance with 100W fast charging and a Hasselblad camera system.',
       199999, 10, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'Xiaomi Redmi Note 13', 'Xiaomi', '128GB', '6GB', 'Ocean Teal', 'New',
       'Budget-friendly with a 108MP camera and 120Hz AMOLED display.',
       39999, 25, (SELECT id FROM categories WHERE slug = 'smartphones'), NULL
UNION ALL
SELECT 'iPad Air (5th Gen)', 'Apple', '64GB', '8GB', 'Space Gray', 'New',
       'M1 chip, 10.9" Liquid Retina display, compatible with Apple Pencil 2.',
       229999, 7, (SELECT id FROM categories WHERE slug = 'tablets'), NULL
UNION ALL
SELECT 'Samsung Galaxy Tab S9', 'Samsung', '128GB', '8GB', 'Beige', 'New',
       'AMOLED 11" display, S Pen included, IP68 water resistance.',
       259999, 4, (SELECT id FROM categories WHERE slug = 'tablets'), NULL
UNION ALL
SELECT 'Apple Watch Series 9', 'Apple', '41mm', NULL, 'Pink', 'New',
       'Double tap gesture, brighter always-on display, health tracking suite.',
       119999, 9, (SELECT id FROM categories WHERE slug = 'smartwatches'), NULL
UNION ALL
SELECT 'Samsung Galaxy Watch 6', 'Samsung', '44mm', NULL, 'Graphite', 'New',
       'Sleep coaching, body composition tracking, rotating bezel design.',
       79999, 11, (SELECT id FROM categories WHERE slug = 'smartwatches'), NULL
UNION ALL
SELECT '20W USB-C Fast Charger', 'Apple', NULL, NULL, 'White', 'New',
       'Original Apple fast charger, compatible with all USB-C iPhones and iPads.',
       4999, 50, (SELECT id FROM categories WHERE slug = 'phone-accessories'), NULL
UNION ALL
SELECT 'Tempered Glass Screen Protector', 'Generic', NULL, NULL, 'Clear', 'New',
       '9H hardness, case-friendly, bubble-free installation kit included.',
       999, 100, (SELECT id FROM categories WHERE slug = 'phone-accessories'), NULL
UNION ALL
SELECT 'Wireless Earbuds Pro', 'Generic', NULL, NULL, 'Black', 'New',
       'Active noise cancellation, 30-hour battery life with charging case.',
       12999, 30, (SELECT id FROM categories WHERE slug = 'phone-accessories'), NULL;
