# FairChance - Golf Charity Subscription Platform

FairChance is a premium, subscription-driven web application combining golf performance tracking, charitable fundraising, and a monthly draw-based reward engine. Designed to fulfill the Digital Heroes Full-Stack PRD, the platform features an emotionally engaging, modern aesthetic that intentionally avoids traditional golf design clichés.

## 🚀 Core Features

- **Subscription Engine:** Support for both Monthly ($10) and Yearly ($100) plans. The entire platform is guarded by real-time subscription validation middleware, restricting inactive users from participating in draws or adding scores.
- **Golf Score Tracking:** Users register their 5 most recent golf scores in Stableford format (1–45). The database automatically prunes older scores to maintain exactly the latest 5 entries in reverse-chronological order.
- **Draw & Reward System:** A robust monthly draw engine (Random vs. Algorithmic modes) where users match 3, 4, or 5 numbers. Jackpots roll over automatically if no one hits a perfect 5-number match.
- **Charity Integration:** 10% of every subscription inherently goes to a registered charity. Users are required to select a specific foundation during the Signup flow, tying their real-world impact directly to their account.
- **Administrative Command Center:** A powerful, tabbed dashboard exclusively for Admins featuring KPI metrics, Draw Engine triggers, full User editing (scores & subscriptions overrides), Charity CRUD management, and a Winner Verification Queue for processing screenshot layouts.

## 🛠 Architecture & Tech Stack

**Frontend:** React (Vite), TailwindCSS v3 (Custom Dark Theme Tokens), Framer Motion, JSX, React Hot Toast
**Backend:** Node.js, Express.js, Custom Middleware Authentication 
**Database/Auth:** Supabase (PostgreSQL), JWT, Bcrypt

## 💻 Local Development Setup

### 1. Supabase Initialization
Create a Supabase project and run the provided SQL migration scripts to construct the `users`, `subscriptions`, `draws`, `charities`, `scores`, and `winners` tables.

### 2. Backend Environment Configuration
Create a `.env` file in the `/server` directory:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Frontend Environment Configuration
Create a `.env.local` file in the `/client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
*(If deployed, point this to your Render/Vercel backend instance).*

### 4. Running Locally
Initialize two terminal instances to run the environments concurrently.

**Terminal 1 (Backend - Express):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend - React):**
```bash
cd client
npm install
npm run dev
```

---
*Built as a Full-Stack Assessment Delivery for Digital Heroes by Vidit Kumar Singh.*
