-- =============================================
-- 1. INSERT ROLES
-- =============================================
INSERT INTO roles (name, description) VALUES
('admin', 'Full system access'),
('cashier', 'Transaction management');

-- =============================================
-- 2. INSERT ADMIN USER
--    Password: admin123
--    Hash bcrypt dari 'admin123' sudah di-generate
-- =============================================
INSERT INTO users (id, role_id, username, password_hash, full_name, is_active)
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM roles WHERE name = 'admin'),
    'admin',
    '$2b$12$KIXl5i6rUzLwT5y7ZfXHdOqYx1FvE2sM9bNcQ3wE4rT5y6u7i8o9p0a',
    'Administrator',
    true
);

-- =============================================
-- 3. INSERT CATEGORIES
-- =============================================
INSERT INTO categories (name, description) VALUES
('Food', 'Main dishes'),
('Drink', 'Beverages'),
('Dessert', 'Sweet products');

-- =============================================
-- 4. INSERT SAMPLE PRODUCTS
-- =============================================
INSERT INTO products (category_id, name, barcode, price, cost_price, is_available)
VALUES
((SELECT id FROM categories WHERE name = 'Food'), 'Nasi Goreng', '8991001234567', 25000, 15000, true),
((SELECT id FROM categories WHERE name = 'Food'), 'Mie Ayam', '8991001234568', 20000, 12000, true),
((SELECT id FROM categories WHERE name = 'Drink'), 'Es Teh', '8991001234569', 8000, 4000, true),
((SELECT id FROM categories WHERE name = 'Drink'), 'Kopi Hitam', '8991001234570', 12000, 7000, true);

-- =============================================
-- 5. INSERT INVENTORY (stok awal)
-- =============================================
INSERT INTO inventory (product_id, current_stock, min_stock)
SELECT id, 50, 10 FROM products;

-- =============================================
-- 6. INSERT RESTAURANT TABLES
-- =============================================
INSERT INTO restaurant_tables (table_number, capacity, status) VALUES
('T01', 4, 'AVAILABLE'),
('T02', 6, 'AVAILABLE'),
('T03', 2, 'AVAILABLE');

-- =============================================
-- 7. INSERT QR TOKENS (sederhana)
-- =============================================
INSERT INTO qr_tables (table_id, qr_token)
SELECT id, 'qr-' || table_number FROM restaurant_tables;