-- Sample Seed Data for FoodApp React Native
-- This file populates the database with initial test data

-- Insert Admin User
INSERT INTO users (id, email, phone, password_hash, role, full_name, email_verified, phone_verified, is_active)
VALUES (
    uuid_generate_v4(),
    'admin@foodapp.com',
    '+1234567890',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    'admin',
    'Admin User',
    TRUE,
    TRUE,
    TRUE
);

-- Insert Test Users
INSERT INTO users (id, email, phone, password_hash, role, full_name, email_verified, phone_verified)
VALUES 
    (uuid_generate_v4(), 'john.doe@example.com', '+1234567891', '$2a$10$HashHere1', 'user', 'John Doe', TRUE, TRUE),
    (uuid_generate_v4(), 'jane.smith@example.com', '+1234567892', '$2a$10$HashHere2', 'user', 'Jane Smith', TRUE, TRUE),
    (uuid_generate_v4(), 'bob.wilson@example.com', '+1234567893', '$2a$10$HashHere3', 'user', 'Bob Wilson', TRUE, FALSE);

-- Insert Food Categories
INSERT INTO food_categories (id, name, description, image_url, is_active)
VALUES 
    (uuid_generate_v4(), 'Pizza', 'Delicious hand-tossed pizzas with fresh ingredients', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', TRUE),
    (uuid_generate_v4(), 'Burgers', 'Juicy burgers made with premium beef', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', TRUE),
    (uuid_generate_v4(), 'Pasta', 'Authentic Italian pasta dishes', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', TRUE),
    (uuid_generate_v4(), 'Salads', 'Fresh and healthy salad options', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', TRUE),
    (uuid_generate_v4(), 'Desserts', 'Sweet treats to end your meal', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', TRUE),
    (uuid_generate_v4(), 'Beverages', 'Refreshing drinks and smoothies', 'https://images.unsplash.com/photo-1544145945-f90425340c7e', TRUE),
    (uuid_generate_v4(), 'Asian Cuisine', 'Authentic Asian flavors', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d', TRUE),
    (uuid_generate_v4(), 'Mexican', 'Spicy and flavorful Mexican dishes', 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f', TRUE);

-- Get category IDs for food items (we'll use subqueries)
-- Insert Food Items
INSERT INTO food_items (id, category_id, name, description, price, image_url, is_available, is_vegetarian, is_vegan, preparation_time, calories)
VALUES 
    -- Pizzas
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Pizza' LIMIT 1), 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and fresh basil', 12.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002', TRUE, TRUE, FALSE, 20, 800),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Pizza' LIMIT 1), 'Pepperoni Pizza', 'Traditional pepperoni with extra cheese', 14.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e', TRUE, FALSE, FALSE, 20, 950),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Pizza' LIMIT 1), 'Veggie Supreme', 'Loaded with fresh vegetables and herbs', 13.99, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f', TRUE, TRUE, TRUE, 22, 720),
    
    -- Burgers
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Burgers' LIMIT 1), 'Classic Cheeseburger', 'Beef patty with cheddar cheese, lettuce, tomato, and special sauce', 10.99, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90', TRUE, FALSE, FALSE, 15, 650),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Burgers' LIMIT 1), 'Bacon BBQ Burger', 'Smoked bacon, BBQ sauce, onion rings, and cheddar', 12.99, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b', TRUE, FALSE, FALSE, 18, 780),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Burgers' LIMIT 1), 'Veggie Burger', 'Plant-based patty with avocado and sprouts', 9.99, 'https://images.unsplash.com/photo-1520072959219-c595dc870360', TRUE, TRUE, TRUE, 15, 450),
    
    -- Pasta
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Pasta' LIMIT 1), 'Spaghetti Carbonara', 'Creamy carbonara with pancetta and parmesan', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3', TRUE, FALSE, FALSE, 25, 720),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Pasta' LIMIT 1), 'Penne Arrabbiata', 'Spicy tomato sauce with garlic and chili', 11.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', TRUE, TRUE, TRUE, 20, 580),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Pasta' LIMIT 1), 'Fettuccine Alfredo', 'Rich and creamy alfredo sauce', 12.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a', TRUE, TRUE, FALSE, 22, 850),
    
    -- Salads
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Salads' LIMIT 1), 'Caesar Salad', 'Romaine lettuce with Caesar dressing and croutons', 8.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1', TRUE, FALSE, FALSE, 10, 320),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Salads' LIMIT 1), 'Greek Salad', 'Fresh vegetables with feta cheese and olives', 9.99, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe', TRUE, TRUE, FALSE, 10, 280),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Salads' LIMIT 1), 'Quinoa Power Bowl', 'Quinoa with roasted vegetables and tahini dressing', 11.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', TRUE, TRUE, TRUE, 12, 420),
    
    -- Desserts
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Desserts' LIMIT 1), 'Chocolate Lava Cake', 'Warm chocolate cake with molten center', 6.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', TRUE, TRUE, FALSE, 12, 480),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Desserts' LIMIT 1), 'Tiramisu', 'Classic Italian coffee-flavored dessert', 7.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', TRUE, TRUE, FALSE, 5, 420),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Desserts' LIMIT 1), 'Cheesecake', 'New York style cheesecake with berry compote', 6.99, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', TRUE, TRUE, FALSE, 5, 390),
    
    -- Beverages
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Beverages' LIMIT 1), 'Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', TRUE, TRUE, TRUE, 5, 110),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Beverages' LIMIT 1), 'Mango Smoothie', 'Thick and creamy mango smoothie', 5.99, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625', TRUE, TRUE, TRUE, 5, 180),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Beverages' LIMIT 1), 'Iced Coffee', 'Cold brew coffee with ice', 3.99, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7', TRUE, TRUE, TRUE, 3, 50),
    
    -- Asian Cuisine
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Asian Cuisine' LIMIT 1), 'Pad Thai', 'Thai stir-fried noodles with peanuts', 12.99, 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb', TRUE, FALSE, FALSE, 18, 620),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Asian Cuisine' LIMIT 1), 'Chicken Fried Rice', 'Wok-fried rice with vegetables and egg', 10.99, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b', TRUE, FALSE, FALSE, 15, 580),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Asian Cuisine' LIMIT 1), 'Vegetable Spring Rolls', 'Crispy spring rolls with sweet chili sauce', 7.99, 'https://images.unsplash.com/photo-1622973536968-3ead9e780960', TRUE, TRUE, TRUE, 12, 280),
    
    -- Mexican
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Mexican' LIMIT 1), 'Chicken Tacos', 'Three soft tacos with grilled chicken', 9.99, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b', TRUE, FALSE, FALSE, 15, 520),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Mexican' LIMIT 1), 'Beef Burrito', 'Large burrito with seasoned beef and beans', 11.99, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f', TRUE, FALSE, FALSE, 18, 680),
    (uuid_generate_v4(), (SELECT id FROM food_categories WHERE name = 'Mexican' LIMIT 1), 'Vegetarian Quesadilla', 'Cheese quesadilla with peppers and onions', 8.99, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9', TRUE, TRUE, FALSE, 12, 540);

-- Insert Promo Codes
INSERT INTO promo_codes (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until, is_active)
VALUES 
    (uuid_generate_v4(), 'WELCOME10', 'Welcome discount for new users', 'percentage', 10.00, 15.00, 5.00, 100, NOW(), NOW() + INTERVAL '30 days', TRUE),
    (uuid_generate_v4(), 'SAVE5', 'Save $5 on orders over $25', 'fixed', 5.00, 25.00, 5.00, 200, NOW(), NOW() + INTERVAL '60 days', TRUE),
    (uuid_generate_v4(), 'FEAST20', '20% off on orders over $50', 'percentage', 20.00, 50.00, 15.00, 50, NOW(), NOW() + INTERVAL '15 days', TRUE);

-- Success message
SELECT 'Database seeded successfully!' AS status;
