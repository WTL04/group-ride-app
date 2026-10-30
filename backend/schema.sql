-- enumeration for ride difficulty
DO $$ BEGIN
  CREATE TYPE ride_difficulty AS ENUM ('challenging', 'intermediate', 'casual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE
);

-- rides
CREATE TABLE IF NOT EXISTS ride (
  ride_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  start_location VARCHAR(50),
  end_location VARCHAR(50),
  distance_km FLOAT,
  difficulty ride_difficulty,
  avg_pace FLOAT,
  max_riders INT CHECK (max_riders > 0 AND max_riders <= 50),
  description TEXT
);
