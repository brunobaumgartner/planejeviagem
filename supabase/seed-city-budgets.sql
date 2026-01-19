-- Inserir dados de orçamento para cidades brasileiras populares
-- Valores em BRL (Real Brasileiro)

INSERT INTO city_budgets (city_name, country, daily_budgets, flight_estimates, currency, notes, last_updated) VALUES
('Rio de Janeiro', 'Brasil', 
  '{"economy": 180, "medium": 350, "comfort": 600}'::jsonb,
  '{"domestic": {"min": 400, "max": 1200}, "international": {"min": 2500, "max": 6000}}'::jsonb,
  'BRL',
  'Cidade maravilhosa, conhecida por praias e Cristo Redentor',
  NOW()
),

('São Paulo', 'Brasil',
  '{"economy": 200, "medium": 400, "comfort": 700}'::jsonb,
  '{"domestic": {"min": 350, "max": 1000}, "international": {"min": 2000, "max": 5500}}'::jsonb,
  'BRL',
  'Maior cidade do Brasil, centro financeiro e cultural',
  NOW()
),

('Salvador', 'Brasil',
  '{"economy": 160, "medium": 300, "comfort": 550}'::jsonb,
  '{"domestic": {"min": 500, "max": 1400}, "international": {"min": 2800, "max": 6500}}'::jsonb,
  'BRL',
  'Capital da Bahia, rica em cultura afro-brasileira',
  NOW()
),

('Florianópolis', 'Brasil',
  '{"economy": 170, "medium": 330, "comfort": 580}'::jsonb,
  '{"domestic": {"min": 450, "max": 1300}, "international": {"min": 2600, "max": 6200}}'::jsonb,
  'BRL',
  'Ilha com praias paradisíacas e ótima qualidade de vida',
  NOW()
),

('Fortaleza', 'Brasil',
  '{"economy": 150, "medium": 280, "comfort": 520}'::jsonb,
  '{"domestic": {"min": 550, "max": 1500}, "international": {"min": 3000, "max": 7000}}'::jsonb,
  'BRL',
  'Praias lindas e cultura nordestina',
  NOW()
),

('Recife', 'Brasil',
  '{"economy": 155, "medium": 290, "comfort": 530}'::jsonb,
  '{"domestic": {"min": 520, "max": 1450}, "international": {"min": 2900, "max": 6800}}'::jsonb,
  'BRL',
  'Veneza brasileira, com praias e arquitetura colonial',
  NOW()
),

('Brasília', 'Brasil',
  '{"economy": 190, "medium": 370, "comfort": 650}'::jsonb,
  '{"domestic": {"min": 400, "max": 1100}, "international": {"min": 2400, "max": 5800}}'::jsonb,
  'BRL',
  'Capital federal, arquitetura modernista',
  NOW()
),

('Curitiba', 'Brasil',
  '{"economy": 165, "medium": 320, "comfort": 570}'::jsonb,
  '{"domestic": {"min": 420, "max": 1150}, "international": {"min": 2500, "max": 6000}}'::jsonb,
  'BRL',
  'Cidade modelo em planejamento urbano',
  NOW()
),

('Porto Alegre', 'Brasil',
  '{"economy": 160, "medium": 310, "comfort": 560}'::jsonb,
  '{"domestic": {"min": 480, "max": 1350}, "international": {"min": 2700, "max": 6400}}'::jsonb,
  'BRL',
  'Capital gaúcha, cultura do chimarrão',
  NOW()
),

('Manaus', 'Brasil',
  '{"economy": 170, "medium": 320, "comfort": 600}'::jsonb,
  '{"domestic": {"min": 600, "max": 1800}, "international": {"min": 3200, "max": 7500}}'::jsonb,
  'BRL',
  'Portal da Amazônia, Teatro Amazonas',
  NOW()
),

('Belo Horizonte', 'Brasil',
  '{"economy": 155, "medium": 300, "comfort": 540}'::jsonb,
  '{"domestic": {"min": 400, "max": 1100}, "international": {"min": 2400, "max": 5800}}'::jsonb,
  'BRL',
  'Pampulha, gastronomia mineira',
  NOW()
),

('Natal', 'Brasil',
  '{"economy": 145, "medium": 270, "comfort": 500}'::jsonb,
  '{"domestic": {"min": 580, "max": 1600}, "international": {"min": 3100, "max": 7200}}'::jsonb,
  'BRL',
  'Cidade do sol, dunas e praias',
  NOW()
),

('João Pessoa', 'Brasil',
  '{"economy": 140, "medium": 260, "comfort": 480}'::jsonb,
  '{"domestic": {"min": 600, "max": 1650}, "international": {"min": 3200, "max": 7400}}'::jsonb,
  'BRL',
  'Ponto mais oriental das Américas',
  NOW()
),

('Maceió', 'Brasil',
  '{"economy": 150, "medium": 280, "comfort": 520}'::jsonb,
  '{"domestic": {"min": 570, "max": 1580}, "international": {"min": 3100, "max": 7100}}'::jsonb,
  'BRL',
  'Praias de águas cristalinas',
  NOW()
),

('Gramado', 'Brasil',
  '{"economy": 200, "medium": 380, "comfort": 700}'::jsonb,
  '{"domestic": {"min": 500, "max": 1400}, "international": {"min": 2800, "max": 6600}}'::jsonb,
  'BRL',
  'Serra gaúcha, clima europeu, Natal Luz',
  NOW()
),

('Foz do Iguaçu', 'Brasil',
  '{"economy": 160, "medium": 300, "comfort": 550}'::jsonb,
  '{"domestic": {"min": 550, "max": 1550}, "international": {"min": 3000, "max": 7000}}'::jsonb,
  'BRL',
  'Cataratas do Iguaçu, tríplice fronteira',
  NOW()
),

('Fernando de Noronha', 'Brasil',
  '{"economy": 350, "medium": 650, "comfort": 1200}'::jsonb,
  '{"domestic": {"min": 1500, "max": 3500}, "international": {"min": 4000, "max": 9000}}'::jsonb,
  'BRL',
  'Arquipélago paradisíaco, mergulho de classe mundial',
  NOW()
),

('Bonito', 'Brasil',
  '{"economy": 180, "medium": 340, "comfort": 620}'::jsonb,
  '{"domestic": {"min": 650, "max": 1800}, "international": {"min": 3300, "max": 7600}}'::jsonb,
  'BRL',
  'Ecoturismo, rios cristalinos, grutas',
  NOW()
)

ON CONFLICT (city_name) DO UPDATE SET
  country = EXCLUDED.country,
  daily_budgets = EXCLUDED.daily_budgets,
  flight_estimates = EXCLUDED.flight_estimates,
  currency = EXCLUDED.currency,
  notes = EXCLUDED.notes,
  last_updated = EXCLUDED.last_updated;
