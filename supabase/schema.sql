-- ============================================
-- Controle Inteligente de Compras Domésticas
-- Schema SQL para Supabase (PostgreSQL)
-- v2 - Sem controle de estoque, foco em lista manual
-- ============================================

-- 1. CATEGORIAS DE PRODUTOS
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SUPERMERCADOS
CREATE TABLE supermarkets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUTOS (CATÁLOGO)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);

-- 4. LISTA DE COMPRAS
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Lista de Compras',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_shopping_lists_status ON shopping_lists(status);

-- 5. ITENS DA LISTA DE COMPRAS
CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sli_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_sli_product ON shopping_list_items(product_id);

-- 6. COMPRAS (CABEÇALHO)
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supermarket_id UUID REFERENCES supermarkets(id) ON DELETE SET NULL,
  total_amount NUMERIC(10,2),
  items_count INT DEFAULT 0,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_market ON purchases(supermarket_id);

-- 7. ITENS DA COMPRA
CREATE TABLE purchase_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,3) DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);

-- 8. HISTÓRICO DE PREÇOS
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supermarket_id UUID NOT NULL REFERENCES supermarkets(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_price_product ON price_history(product_id);
CREATE INDEX idx_price_market ON price_history(supermarket_id);
CREATE INDEX idx_price_date ON price_history(date);

-- ============================================
-- VIEW: Melhor preço por produto
-- ============================================
CREATE VIEW v_best_prices AS
SELECT DISTINCT ON (ph.product_id)
  ph.product_id,
  p.name AS product_name,
  sm.name AS supermarket_name,
  ph.price,
  ph.date
FROM price_history ph
JOIN products p ON p.id = ph.product_id
JOIN supermarkets sm ON sm.id = ph.supermarket_id
ORDER BY ph.product_id, ph.price ASC, ph.date DESC;

-- ============================================
-- SEED: Categorias
-- ============================================
INSERT INTO categories (name, icon, sort_order) VALUES
  ('Hortifruti',  '🥬', 1),
  ('Carnes',      '🥩', 2),
  ('Bebidas',     '🥤', 3),
  ('Laticínios',  '🧀', 4),
  ('Limpeza',     '🧹', 5),
  ('Higiene',     '🧴', 6),
  ('Congelados',  '🧊', 7),
  ('Padaria',     '🍞', 8),
  ('Outros',      '📦', 9);

-- ============================================
-- SEED: Produtos comuns de supermercado
-- ============================================

-- Hortifruti
INSERT INTO products (name, category_id) VALUES
  ('Banana',        (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Maçã',          (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Laranja',       (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Tomate',        (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Cebola',        (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Alho',          (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Batata',        (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Cenoura',       (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Alface',        (SELECT id FROM categories WHERE name = 'Hortifruti')),
  ('Limão',         (SELECT id FROM categories WHERE name = 'Hortifruti'));

-- Carnes
INSERT INTO products (name, category_id) VALUES
  ('Frango (peito)',      (SELECT id FROM categories WHERE name = 'Carnes')),
  ('Frango (coxa)',       (SELECT id FROM categories WHERE name = 'Carnes')),
  ('Carne moída',         (SELECT id FROM categories WHERE name = 'Carnes')),
  ('Bisteca suína',       (SELECT id FROM categories WHERE name = 'Carnes')),
  ('Linguiça',            (SELECT id FROM categories WHERE name = 'Carnes')),
  ('Ovos',                (SELECT id FROM categories WHERE name = 'Carnes')),
  ('Peixe (filé)',        (SELECT id FROM categories WHERE name = 'Carnes'));

-- Bebidas
INSERT INTO products (name, category_id) VALUES
  ('Água mineral',        (SELECT id FROM categories WHERE name = 'Bebidas')),
  ('Refrigerante',        (SELECT id FROM categories WHERE name = 'Bebidas')),
  ('Suco de laranja',     (SELECT id FROM categories WHERE name = 'Bebidas')),
  ('Café em pó',          (SELECT id FROM categories WHERE name = 'Bebidas')),
  ('Chá',                 (SELECT id FROM categories WHERE name = 'Bebidas')),
  ('Achocolatado',        (SELECT id FROM categories WHERE name = 'Bebidas'));

-- Laticínios
INSERT INTO products (name, category_id) VALUES
  ('Leite integral',      (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Leite desnatado',     (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Queijo muçarela',     (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Queijo prato',        (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Iogurte natural',     (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Manteiga',            (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Requeijão',           (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Creme de leite',      (SELECT id FROM categories WHERE name = 'Laticínios')),
  ('Leite condensado',    (SELECT id FROM categories WHERE name = 'Laticínios'));

-- Limpeza
INSERT INTO products (name, category_id) VALUES
  ('Detergente',          (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Sabão em pó',         (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Amaciante',           (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Água sanitária',      (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Desinfetante',        (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Esponja',             (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Saco de lixo',        (SELECT id FROM categories WHERE name = 'Limpeza')),
  ('Papel toalha',        (SELECT id FROM categories WHERE name = 'Limpeza'));

-- Higiene
INSERT INTO products (name, category_id) VALUES
  ('Papel higiênico',     (SELECT id FROM categories WHERE name = 'Higiene')),
  ('Sabonete',            (SELECT id FROM categories WHERE name = 'Higiene')),
  ('Shampoo',             (SELECT id FROM categories WHERE name = 'Higiene')),
  ('Condicionador',       (SELECT id FROM categories WHERE name = 'Higiene')),
  ('Creme dental',        (SELECT id FROM categories WHERE name = 'Higiene')),
  ('Desodorante',         (SELECT id FROM categories WHERE name = 'Higiene'));

-- Congelados
INSERT INTO products (name, category_id) VALUES
  ('Pizza congelada',     (SELECT id FROM categories WHERE name = 'Congelados')),
  ('Lasanha congelada',   (SELECT id FROM categories WHERE name = 'Congelados')),
  ('Hambúrguer',          (SELECT id FROM categories WHERE name = 'Congelados')),
  ('Sorvete',             (SELECT id FROM categories WHERE name = 'Congelados'));

-- Padaria
INSERT INTO products (name, category_id) VALUES
  ('Pão francês',         (SELECT id FROM categories WHERE name = 'Padaria')),
  ('Pão de forma',        (SELECT id FROM categories WHERE name = 'Padaria')),
  ('Bolo pronto',         (SELECT id FROM categories WHERE name = 'Padaria')),
  ('Biscoito cream cracker', (SELECT id FROM categories WHERE name = 'Padaria')),
  ('Biscoito recheado',   (SELECT id FROM categories WHERE name = 'Padaria'));

-- Outros (Mercearia / Básicos)
INSERT INTO products (name, category_id) VALUES
  ('Arroz',               (SELECT id FROM categories WHERE name = 'Outros')),
  ('Feijão',              (SELECT id FROM categories WHERE name = 'Outros')),
  ('Macarrão',            (SELECT id FROM categories WHERE name = 'Outros')),
  ('Óleo de soja',        (SELECT id FROM categories WHERE name = 'Outros')),
  ('Azeite',              (SELECT id FROM categories WHERE name = 'Outros')),
  ('Açúcar',              (SELECT id FROM categories WHERE name = 'Outros')),
  ('Sal',                 (SELECT id FROM categories WHERE name = 'Outros')),
  ('Farinha de trigo',    (SELECT id FROM categories WHERE name = 'Outros')),
  ('Molho de tomate',     (SELECT id FROM categories WHERE name = 'Outros')),
  ('Maionese',            (SELECT id FROM categories WHERE name = 'Outros')),
  ('Ketchup',             (SELECT id FROM categories WHERE name = 'Outros')),
  ('Vinagre',             (SELECT id FROM categories WHERE name = 'Outros')),
  ('Margarina',           (SELECT id FROM categories WHERE name = 'Outros'));
