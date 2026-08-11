-- ============================================================
-- Phase 6 migration — run this AFTER migration_phase3.sql.
-- Turns products into marketplace listings: adds who's selling it
-- and an admin approval status. Existing (admin-seeded) products
-- default to 'approved' automatically.
--
-- Run with: mysql -u root -p ecommerce_store < migration_phase6.sql
-- ============================================================

USE ecommerce_store;

ALTER TABLE products
    ADD COLUMN seller_id INT NULL AFTER category_id,
    ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER seller_id,
    ADD COLUMN rejection_reason VARCHAR(255) NULL AFTER approval_status,
    ADD CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL;
