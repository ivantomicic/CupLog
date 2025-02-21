/*
  # Initial Schema Setup for Coffee Brew Logger

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text)
      - `name` (text)
      - `created_at` (timestamp)
      - `settings` (jsonb) - for user preferences

    - `brewers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `material` (text)
      - `type` (text)
      - `created_at` (timestamp)

    - `grinders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `burr_size` (text)
      - `burr_type` (text)
      - `ideal_for` (text)
      - `created_at` (timestamp)

    - `coffees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `country` (text)
      - `region` (text)
      - `farm` (text)
      - `altitude` (text)
      - `roast` (text)
      - `created_at` (timestamp)

    - `roast_dates`
      - `id` (uuid, primary key)
      - `coffee_id` (uuid, foreign key)
      - `date` (date)
      - `created_at` (timestamp)

    - `brews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `coffee_id` (uuid, foreign key)
      - `roast_date_id` (uuid, foreign key)
      - `grinder_id` (uuid, foreign key)
      - `brewer_id` (uuid, foreign key)
      - `date` (timestamp)
      - `grind_size` (text)
      - `brew_time` (integer)
      - `dose` (decimal)
      - `yield` (decimal)
      - `notes` (text)
      - `image_url` (text)
      - `ai_suggestions` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add foreign key constraints for data integrity
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  name text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create brewers table
CREATE TABLE brewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  material text,
  type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own brewers"
  ON brewers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create grinders table
CREATE TABLE grinders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  burr_size text,
  burr_type text,
  ideal_for text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grinders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grinders"
  ON grinders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create coffees table
CREATE TABLE coffees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  country text,
  region text,
  farm text,
  altitude text,
  roast text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own coffees"
  ON coffees
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create roast_dates table
CREATE TABLE roast_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coffee_id uuid REFERENCES coffees(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roast_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own roast dates"
  ON roast_dates
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM coffees
    WHERE coffees.id = roast_dates.coffee_id
    AND coffees.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM coffees
    WHERE coffees.id = roast_dates.coffee_id
    AND coffees.user_id = auth.uid()
  ));

-- Create brews table
CREATE TABLE brews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  coffee_id uuid REFERENCES coffees(id) ON DELETE CASCADE NOT NULL,
  roast_date_id uuid REFERENCES roast_dates(id) ON DELETE SET NULL,
  grinder_id uuid REFERENCES grinders(id) ON DELETE SET NULL,
  brewer_id uuid REFERENCES brewers(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  grind_size text,
  brew_time integer,
  dose decimal(10,2),
  yield decimal(10,2),
  notes text,
  image_url text,
  ai_suggestions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own brews"
  ON brews
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_brewers_user_id ON brewers(user_id);
CREATE INDEX idx_grinders_user_id ON grinders(user_id);
CREATE INDEX idx_coffees_user_id ON coffees(user_id);
CREATE INDEX idx_brews_user_id ON brews(user_id);
CREATE INDEX idx_brews_coffee_id ON brews(coffee_id);
CREATE INDEX idx_roast_dates_coffee_id ON roast_dates(coffee_id);