-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'logged' CHECK (role IN ('logged', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  budget TEXT NOT NULL,
  budget_amount DECIMAL,
  progress INTEGER DEFAULT 0,
  tasks JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'purchased', 'in_progress', 'delivered', 'completed')),
  purchase_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mercadopago', 'stripe')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Create city_budgets table
CREATE TABLE IF NOT EXISTS city_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  daily_budgets JSONB NOT NULL DEFAULT '{"economy": 150, "medium": 300, "comfort": 500}'::jsonb,
  flight_estimates JSONB NOT NULL DEFAULT '{"domestic": {"min": 400, "max": 1200}, "international": {"min": 1500, "max": 5000}}'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_trip_id ON purchases(trip_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_budgets ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'logged'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Trips policies
CREATE POLICY "Users can view their own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- Purchases policies
CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- City budgets policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view city budgets"
  ON city_budgets FOR SELECT
  TO authenticated
  USING (true);

-- Insert default city budget data
INSERT INTO city_budgets (city_name, country, daily_budgets, flight_estimates) VALUES
  ('Rio de Janeiro', 'Brasil', 
   '{"economy": 150, "medium": 300, "comfort": 500}'::jsonb,
   '{"domestic": {"min": 400, "max": 800}, "international": {"min": 2000, "max": 4000}}'::jsonb),
  ('São Paulo', 'Brasil',
   '{"economy": 180, "medium": 350, "comfort": 600}'::jsonb,
   '{"domestic": {"min": 300, "max": 700}, "international": {"min": 2000, "max": 4500}}'::jsonb),
  ('Paris', 'França',
   '{"economy": 400, "medium": 800, "comfort": 1500}'::jsonb,
   '{"domestic": {"min": 150, "max": 400}, "international": {"min": 2500, "max": 6000}}'::jsonb),
  ('Tóquio', 'Japão',
   '{"economy": 500, "medium": 900, "comfort": 1800}'::jsonb,
   '{"domestic": {"min": 200, "max": 500}, "international": {"min": 3500, "max": 8000}}'::jsonb),
  ('Nova York', 'Estados Unidos',
   '{"economy": 450, "medium": 850, "comfort": 1600}'::jsonb,
   '{"domestic": {"min": 300, "max": 800}, "international": {"min": 2800, "max": 6500}}'::jsonb),
  ('Buenos Aires', 'Argentina',
   '{"economy": 200, "medium": 400, "comfort": 700}'::jsonb,
   '{"domestic": {"min": 300, "max": 600}, "international": {"min": 1500, "max": 3500}}'::jsonb)
ON CONFLICT (city_name) DO NOTHING;