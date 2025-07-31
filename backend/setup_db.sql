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

-- Football Data Tables
-- Players/Squad table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    age INTEGER,
    nationality VARCHAR(10),
    photo VARCHAR(500),
    number VARCHAR(10),
    matches INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fixtures table
CREATE TABLE IF NOT EXISTS fixtures (
    id SERIAL PRIMARY KEY,
    fixture_date DATE,
    home_team VARCHAR(255),
    away_team VARCHAR(255),
    home_logo VARCHAR(500),
    away_logo VARCHAR(500),
    competition VARCHAR(255),
    round VARCHAR(255),
    venue VARCHAR(50),
    home_score INTEGER,
    away_score INTEGER,
    result VARCHAR(1), -- W, L, D
    attendance VARCHAR(50),
    referee VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Standings table
CREATE TABLE IF NOT EXISTS standings (
    id SERIAL PRIMARY KEY,
    position INTEGER,
    points INTEGER,
    played INTEGER,
    won INTEGER,
    drawn INTEGER,
    lost INTEGER,
    goal_difference INTEGER,
    season VARCHAR(20) DEFAULT '2024-25',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data cache table to track last update times
CREATE TABLE IF NOT EXISTS data_cache (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50) UNIQUE NOT NULL, -- 'players', 'fixtures', 'standings'
    last_scraped TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_updating BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON fixtures(fixture_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_teams ON fixtures(home_team, away_team);
CREATE INDEX IF NOT EXISTS idx_standings_position ON standings(position);
CREATE INDEX IF NOT EXISTS idx_data_cache_type ON data_cache(data_type);

-- Insert initial cache tracking records
INSERT INTO data_cache (data_type, last_scraped, last_updated) VALUES
    ('players', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('fixtures', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('standings', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (data_type) DO NOTHING; 