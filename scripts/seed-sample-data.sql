-- Seed sample data for development and testing
-- This script adds sample products and data for demonstration

-- Insert sample user (in production, this would be handled by authentication)
INSERT INTO users (email, name) VALUES 
('admin@example.com', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for sample data
DO $$
DECLARE
    sample_user_id INTEGER;
BEGIN
    SELECT id INTO sample_user_id FROM users WHERE email = 'admin@example.com';
    
    -- Insert sample products
    INSERT INTO products (
        user_id, bling_id, name, sku, description, price, cost_price, 
        stock_quantity, min_stock_level, status, category, barcode
    ) VALUES 
    (
        sample_user_id, 1001, 'Smartphone Galaxy S24', 'SGS24-001',
        'Smartphone Samsung Galaxy S24 128GB - Preto', 2999.99, 2200.00,
        45, 10, 'active', 'Eletrônicos', '7891234567890'
    ),
    (
        sample_user_id, 1002, 'Notebook Dell Inspiron', 'NDI-002',
        'Notebook Dell Inspiron 15 3000 Intel Core i5 8GB 256GB SSD', 3499.99, 2800.00,
        12, 5, 'active', 'Informática', '7891234567891'
    ),
    (
        sample_user_id, 1003, 'Mouse Wireless Logitech', 'MWL-003',
        'Mouse Sem Fio Logitech M280 com Conexão USB', 149.99, 89.99,
        3, 15, 'low_stock', 'Acessórios', '7891234567892'
    ),
    (
        sample_user_id, 1004, 'Teclado Mecânico Gamer', 'TMG-004',
        'Teclado Mecânico Gamer RGB Switch Blue', 299.99, 180.00,
        25, 8, 'active', 'Acessórios', '7891234567893'
    ),
    (
        sample_user_id, 1005, 'Monitor LED 24 Polegadas', 'MLP-005',
        'Monitor LED 24" Full HD 1920x1080 HDMI VGA', 899.99, 650.00,
        8, 5, 'active', 'Monitores', '7891234567894'
    )
    ON CONFLICT (bling_id) DO NOTHING;
    
    -- Insert sample stock movements
    INSERT INTO stock_movements (
        product_id, user_id, movement_type, quantity, previous_stock, new_stock, reason
    ) 
    SELECT 
        p.id, sample_user_id, 'in', 50, 0, 50, 'Initial stock'
    FROM products p 
    WHERE p.user_id = sample_user_id AND p.sku = 'SGS24-001';
    
    INSERT INTO stock_movements (
        product_id, user_id, movement_type, quantity, previous_stock, new_stock, reason
    ) 
    SELECT 
        p.id, sample_user_id, 'out', 5, 50, 45, 'Sale'
    FROM products p 
    WHERE p.user_id = sample_user_id AND p.sku = 'SGS24-001';
    
    -- Insert sample sync log
    INSERT INTO sync_logs (
        user_id, sync_type, status, products_synced, started_at, completed_at
    ) VALUES (
        sample_user_id, 'full', 'completed', 5, 
        CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '55 minutes'
    );
    
END $$;
