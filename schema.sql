-- 1. 농장 정보 테이블 (Farms)
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 사용자 프로필 테이블 (Profiles)
-- Supabase Auth의 auth.users 테이블과 연결됩니다.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'INSPECTOR', 'OWNER')) DEFAULT 'OWNER',
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 점검 항목 기준 테이블 (Items)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 예: 사육환경, 급이/급수 등
  name TEXT NOT NULL,     -- 점검 항목명
  description TEXT,       -- 세부 기준 설명
  max_score INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 점검 리포트 메인 테이블 (Reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 리포트 대상자(농장주)
  inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 점검자
  overall_comment TEXT,
  is_virtual BOOLEAN DEFAULT FALSE, -- 자가진단 여부
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 리포트 상세 결과 테이블 (Report Results)
CREATE TABLE IF NOT EXISTS report_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  score INTEGER,
  status TEXT CHECK (status IN ('PASS', 'FAIL', 'N/A')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_results ENABLE ROW LEVEL SECURITY;

-- 개발용 전체 허용 정책 (보안이 필요할 경우 나중에 수정하세요)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'farms') THEN
        CREATE POLICY "Allow all for authenticated" ON farms FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'profiles') THEN
        CREATE POLICY "Allow all for authenticated" ON profiles FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'items') THEN
        CREATE POLICY "Allow all for authenticated" ON items FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'reports') THEN
        CREATE POLICY "Allow all for authenticated" ON reports FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'report_results') THEN
        CREATE POLICY "Allow all for authenticated" ON report_results FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- 초기 샘플 데이터 삽입
INSERT INTO items (category, name, description, max_score) 
SELECT '사육 환경', '바닥 상태', '가축이 편히 쉴 수 있는 건조하고 청결한 바닥 제공 여부', 5
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = '바닥 상태');

INSERT INTO items (category, name, description, max_score) 
SELECT '급이 및 급수', '음수 청결도', '신선하고 깨끗한 물의 상시 공급 여부', 5
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = '음수 청결도');
