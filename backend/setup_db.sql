-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    is_offer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_offer ON items(is_offer);

-- Add some sample data
INSERT INTO items (name, price, is_offer) VALUES
    ('Sample Item 1', 10.99, FALSE),
    ('Sample Item 2', 25.50, TRUE),
    ('Sample Item 3', 5.00, FALSE)
ON CONFLICT DO NOTHING; 