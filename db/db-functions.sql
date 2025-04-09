--------------------- FUNCTIONS -------------------------

-- Create a new user profiles table entry
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, avatar_url, created_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure updated_at maintains the latest time of a change in user profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---------------------- TRIGGERS -------------------------

-- create new user function trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- user profile updated_at trigger
CREATE TRIGGER update_user_profiles_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

---------------------------------------------------------
-- Possible replacement for the GET request on dashboard/page.tsx

create or replace function get_dashboard_data(user_uuid uuid)
returns json as $$
declare
  budgets json;
  metals json;
  crypto json;
  currencies json;
  stocks json;
begin
  select json_agg(b) into budgets from budgets b where b.user_id = user_uuid;
  select json_agg(m) into metals from metals m;
  select json_agg(c) into crypto from crypto c;
  select json_agg(cu) into currencies from currencies cu;
  select json_agg(s) into stocks from stocks s;

  return json_build_object(
    'budgets', budgets,
    'metals', metals,
    'crypto', crypto,
    'currencies', currencies,
    'stocks', stocks
  );
end;
$$ language plpgsql;

-- query like this: 
-- const { data, error } = await supabase.rpc("get_dashboard_data", {
--   user_uuid: user.id
-- });
