# Controle Inteligente de Compras Domésticas (PWA)

Desenvolvimento de uma aplicação web responsiva (PWA) focada em simplicidade e acessibilidade para o público idoso (70+ anos). O sistema funcionará como um assistente doméstico para gerenciamento de estoque, listas de compras e comparação de preços.

## Overview
What: Controle Inteligente de Compras Domésticas
Why: Para facilitar o dia a dia de idosos no controle de estoque, lembrar o que comprar e registrar compras com simplicidade.

## Project Type
WEB (PWA)

## Success Criteria
- PWA instalável e funcional offline (modo supermercado).
- Interface de altíssima acessibilidade (WCAG AA+, fontes XL, botões min 48px, alto contraste, sem elementos complexos).
- Módulos de Estoque, Lista de Compras, Histórico, OCR e Comparação operacionais.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database / Backend**: Supabase (PostgreSQL, Auth, Storage para fotos)
- **Styling**: Tailwind CSS v4 (Foco em contraste e variáveis globais acessíveis)
- **UI Components**: shadcn/ui (Customizado para botões e inputs muito grandes)
- **State Management**: Zustand (com localStorage persistence para PWA offline)
- **PWA**: `next-pwa` ou `serwist`
- **Language**: TypeScript

## File Structure
```
/src
  /app
    /(dashboard)          # Página inicial com alertas e gráficos
    /inventory            # Controle de estoque doméstico
    /shopping-list        # Geração de listas e modo supermercado
    /purchases            # Histórico e OCR
    /supermarkets         # Cadastro de mercados
    /price-comparison     # Comparação de preços
  /components
    /ui                   # Componentes base (shadcn/ui XL)
    /dashboard            # Gráficos e alertas
    /product-card         # Cartão com foto e controles
    /stock-card           # Controle de estoque com cores
    /list-item            # Item da lista (fácil de riscar/clicar)
  /lib
    supabase.ts           # Cliente Supabase
    utils.ts              # Utilitários gerais
    ocr.ts                # Lógica de extração de cupons
    ai.ts                 # Lógica de sugestão e previsão
  /store
    useStockStore.ts      # Zustand state
    useShoppingListStore.ts
  /types                  # Definições TypeScript
```

## Task Breakdown

### Phase 1: Foundation
- **T1**: `frontend-specialist` (clean-code) - Inicializar Next.js + Tailwind + shadcn/ui. **IN**: N/A -> **OUT**: Projeto base -> **VERIFY**: Next.js app running.
- **T2**: `frontend-specialist` (clean-code) - Configurar Service Worker e Manifest para PWA offline. **IN**: Configs -> **OUT**: PWA manifest -> **VERIFY**: Lighthouse PWA check.
- **T3**: `frontend-specialist` (frontend-design) - Criar Design System acessível (cores, tamanhos). **IN**: Regras -> **OUT**: globals.css atualizado -> **VERIFY**: Botões com hitboxes adequados.

### Phase 2: Database & State
- **T4**: `database-architect` (database-design) - Configurar Supabase e criar schema SQL das 8 tabelas. **IN**: Schema plan -> **OUT**: Supabase SQL script -> **VERIFY**: Tabelas criadas.
- **T5**: `frontend-specialist` (clean-code) - Implementar Zustand Stores (`useStockStore`, `useShoppingListStore`) com persistência. **IN**: State specs -> **OUT**: Store hooks -> **VERIFY**: Dados salvam no localStorage.

### Phase 3: Core Modules
- **T6**: `frontend-specialist` - Módulo de Produtos (CRUD e fotos via câmera/upload). **IN**: DB/State -> **OUT**: Tela de Produtos -> **VERIFY**: Produto criado salva corretamente.
- **T7**: `frontend-specialist` - Módulo de Estoque (Alertas vermelhos se < mínimo). **IN**: Componentes visuais -> **OUT**: Painel de Estoque -> **VERIFY**: Cores dinâmicas funcionando.
- **T8**: `frontend-specialist` - Lista de Compras (Auto-geração e Modo Supermercado offline). **IN**: Estado do Estoque -> **OUT**: Tela de Lista -> **VERIFY**: Checkbox enorme e "riscar" item.

### Phase 4: Advanced Features
- **T9**: `backend-specialist` - Integração de OCR para extração de dados de cupons. **IN**: Imagem -> **OUT**: JSON de compra -> **VERIFY**: Parse correto de mercado, preço e item.
- **T10**: `frontend-specialist` - Histórico de Compras e Comparador de Preços. **IN**: Dados OCR -> **OUT**: Telas de relatórios -> **VERIFY**: Melhor preço é destacado por produto.
- **T11**: `frontend-specialist` - Módulo de Dashboard, Gráficos e Exportação (PDF/WhatsApp). **IN**: Todas as infos -> **OUT**: PDF gerado e URL do zap -> **VERIFY**: Download funciona.

## Phase X: Verification
- [ ] Segurança: `python .agents/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] Acessibilidade e UX Audit (Contraste alto e botões grandes): `python .agents/skills/frontend-design/scripts/ux_audit.py .`
- [ ] Lighthouse PWA e Performance: `python .agents/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000`
- [ ] Build de Produção: `npm run build`
