# BillMate v16 — Smart POS for Indian Food Businesses

Offline-first POS app for cafes, restaurants, food trucks, kiosks, bakeries, and franchise outlets.

## Stack
- **Next.js 14** App Router
- **Tailwind CSS**
- **IndexedDB** (raw, no wrapper) — all data stored locally, works offline
- **Supabase** optional cloud sync
- **Paise-based integer arithmetic** — no float rounding errors

## Quick Start

```bash
# 1. Install
npm install

# 2. (Optional) Add Supabase for cloud sync
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run
npm run dev
```

Open http://localhost:3000 → 3-step onboarding → Start billing

## Deploy on Vercel

```bash
npx vercel
```

Or push to GitHub → import on vercel.com → add env vars → Deploy.

## Supabase Setup (optional)

1. Create project on supabase.com
2. Paste `supabase-schema.sql` into the SQL editor and run
3. Add keys to `.env.local`

## Features

| Feature | Status |
|---------|--------|
| Onboarding (3 steps) | ✅ |
| POS — desktop 65/35 split | ✅ |
| POS — mobile sticky cart bar | ✅ |
| Category pills + search | ✅ |
| Item config modal (sizes, portions, add-ons) | ✅ |
| Fast-add items (no modal) | ✅ |
| Cart — qty, remove, discount, GST | ✅ |
| Checkout — Cash/UPI/Card | ✅ |
| Cash change calculator | ✅ |
| Quick cash buttons | ✅ |
| Orders — today + all, expandable | ✅ |
| Menu CRUD — categories + items | ✅ |
| Business-type-aware fields | ✅ |
| IndexedDB offline storage | ✅ |
| Supabase background sync | ✅ |
| Settings — GST, profile, reset | ✅ |
| PWA manifest | ✅ |

## Project Structure

```
app/
  onboarding/     3-step setup
  pos/            Main billing screen
  orders/         Order history + stats
  menu/           Full CRUD menu editor
  settings/       Business profile + GST

components/
  ui/             Modal, BottomNav, ToastContainer
  pos/            MenuItemCard, CartPanel, ItemConfigModal, CheckoutModal

lib/
  types.ts        All TypeScript interfaces
  db/             Raw IndexedDB (no external wrapper)
  store/          Global state via useReducer + Context
  supabase/       Optional cloud sync
  utils/          Paise math, formatters, menu templates
```

## Money Handling

All values stored as **integer paise** (100 paise = ₹1).  
Never store floats. Never do float math.

```
subtotal  = Σ (unitPricePaise + addOnPaise) × qty
discount  = flat ₹ in paise  OR  percent of subtotal
GST       = (subtotal - discount) × gstPercent / 100
total     = subtotal - discount + GST
```
