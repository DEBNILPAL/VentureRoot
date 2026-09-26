# 🌱 VentureRoot (GramUdyog)

> **Next-Generation MSME Geospatial Feasibility & Enterprise Intelligence Platform for India**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

---

## 📖 Overview

**VentureRoot** is an AI-powered enterprise planning and feasibility platform designed specifically for Indian micro, small, and medium enterprises (MSMEs), rural agro-ventures, and grassroots entrepreneurs. 

It empowers founders with hyper-local geospatial market radar, real-time competitor discovery, automated viability scoring, dynamic capital and financial trajectories, compliance and license roadmaps, and an intelligent multilingual AI business advisor.

---

## 🚀 Key Features

### 🗺️ Hyper-Local Geospatial Competitor Radar
- **Multi-Zone Catchment Mapping**: Interactive OpenStreetMap canvas with 5 km (Core), 10 km (Regional), and 20 km (District) trade circles.
- **Verified POI & Competitor Classification**: Direct competitors, indirect competitors, APMC mandis/markets, transport hubs, supply nodes, and population centers.
- **Resilient Map Engine with Live Reload**: Built-in "Reload Map" recovery controls to seamlessly re-initialize canvas tiles, re-fetch radar nodes, and recover from network interruptions.

### 📍 Comprehensive All-India Location Intelligence
- **Authoritative Census Hierarchy**: Complete built-in master directory covering all 28 States, 8 Union Territories, and 700+ official Indian Districts.
- **Strict National Boundary Validation**: Real-time validation that blocks invalid locations, foreign queries (e.g. outside India), and random test strings (`xyz`, `abc`). Prompts with a clear interactive dialog modal when input requires correction.
- **Dual-Mode Location Input**: Instant autocomplete with OpenStreetMap Nominatim geocoding plus cascading State &rarr; District &rarr; Block &rarr; Village manual selectors.

### 📊 Instant Feasibility & Viability Analysis
- **Predictive Feasibility Scoring**: Conformal AI scoring evaluating demand density, competitive saturation, infrastructure access, and market opportunity.
- **APMC Mandi Price Intelligence**: Localized market pricing benchmarks with statistical confidence intervals.
- **Demographic Reach Estimations**: Population reach and catchment consumer estimates tailored to Indian rural and semi-urban clusters.

### 💰 Financial Trajectory & Capital Modeling
- **Dynamic Cost Breakdown**: Working capital, machinery investment, facility setup, and operational margin calculations.
- **5-Year Growth Curves**: Visual financial trajectory forecasting revenue, EBITDA, operational costs, and break-even milestones using Recharts.
- **Dynamic Resource Suggestions**: Automatically recommends essential equipment, power capacity (HP), and land area tailored to selected enterprise categories.

### 📜 Regulatory & Government Scheme Roadmap
- **Step-by-Step Licensing**: Actionable guidance for Udyam MSME registration, FSSAI Food Safety, GSTIN, State Pollution Control Board NOCs, and Gram Panchayat Trade permits.
- **Subsidy Navigator**: Direct integration with government scheme eligibility (PMEGP, Mudra Yojana, PM-FME, and state credit subsidies).

### 🤖 Multilingual AI Advisor & Voice Synthesis
- **Context-Aware Business Copilot**: Powered by Gemini Flash and RAG knowledge retrieval on Indian market regulations and business models.
- **Multi-Language Localization**: Full UI translation support for English, Hindi, and regional Indian languages.
- **Voice Intelligence**: Text-to-speech voice generation support via ElevenLabs and OpenAI Speech.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Graphics**: [Lucide React](https://lucide.dev/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with [Supabase PostgreSQL](https://supabase.com/)
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/), OpenStreetMap Nominatim
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Form Handling & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [TanStack React Query](https://tanstack.com/query)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the variables below.

> **Note**: For security, sensitive keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `OPENAI_API_KEY`, etc.) are left blank. Public microservice URLs and mock values are provided for reference.

```env
# Runtime Environment & App URLs
NODE_ENV=development
APP_NAME=VentureRoot Backend
APP_URL=http://localhost:3000
API_PREFIX=/api/v1
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_DATA_SOURCE=database

# Supabase Authentication & Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Prisma Database Connections (PostgreSQL / Supabase Pooler)
# Pooled connection URL (used by Prisma Client in production/serverless)
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection URL (used for Prisma migrations and schema push)
DIRECT_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:5432/postgres

# Microservices & ML Engine Endpoints
MODEL1_URL=https://ventureroot.onrender.com
MODEL2_URL=https://ventureroot-1.onrender.com
MODEL3_URL=https://ventureroot-2.onrender.com
DATA_SERVICE_URL=http://127.0.0.1:8000
FINANCE_ENGINE_URL=https://ventureroot-finance-engine.onrender.com
AI_ADVISOR_URL=http://127.0.0.1:8005
RAG_SERVICE_URL=https://ventureroot-rag-model.onrender.com

# Google Gemini AI Advisor & RAG Configuration
# Enter your Google AI Studio API key below:
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# Groq API Key (Ultra-fast LLM translation & advisory)
GROQ_API_KEY=

# OpenStreetMap / LocationIQ Geocoding & Map Tiles (Optional)
# Leave blank to use default OpenStreetMap tiles and Nominatim geocoding
OPENSTREETMAP_API_KEY=
NEXT_PUBLIC_OPENSTREETMAP_API_KEY=

# Voice & Speech Engine Configuration (ElevenLabs & OpenAI)
# Enter your ElevenLabs and OpenAI API keys below:
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
OPENAI_API_KEY=
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Database**: PostgreSQL (or a free [Supabase](https://supabase.com/) project)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/VentureRoot.git
cd VentureRoot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the sample environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your database credentials and API keys.

### 4. Initialize Database Schema

Generate the Prisma client and sync schema with your database:

```bash
npx prisma generate
npx prisma db push
```

*(Optional) Seed initial business categories and baseline benchmarks:*

```bash
npm run seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Structure

```text
VentureRoot/
├── prisma/
│   └── schema.prisma              # Database schema definitions
├── public/                        # Static assets, icons, and illustrations
├── src/
│   ├── app/                       # Next.js App Router (pages & API routes)
│   │   ├── (auth)/                # Authentication routes (login, register)
│   │   ├── (dashboard)/           # Protected dashboard view layouts
│   │   │   ├── analysis/          # Feasibility & geospatial radar page
│   │   │   ├── business/          # Business creation, editing, & view
│   │   │   ├── dashboard/         # Main entrepreneur dashboard overview
│   │   │   └── settings/          # Profile & enterprise preferences
│   │   └── api/v1/                # REST endpoints (feasibility, reports, etc.)
│   ├── components/
│   │   ├── layout/                # Headers, Sidebar, Dashboard backgrounds
│   │   ├── maps/                  # OpenStreetMap RadiusMap & Radar components
│   │   └── ui/                    # Reusable charts, loaders, inputs & modals
│   ├── features/
│   │   ├── business/              # Business wizard, schemas, & forms
│   │   ├── i18n/                  # Multi-language translation hooks
│   │   ├── location/              # Location intelligence & map views
│   │   └── profile/               # Entrepreneur profile & onboarding
│   ├── lib/
│   │   ├── data/                  # India census data & state/district masters
│   │   └── prisma.ts              # Prisma database client singleton
│   └── services/                  # Geocoding, feasibility, & ML connectors
├── .env.example                   # Template environment variables
├── package.json                   # Dependencies and npm scripts
├── tsconfig.json                  # TypeScript compiler settings
└── README.md                      # Project documentation
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle for deployment |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality issues |
| `npx prisma studio` | Opens Prisma Studio GUI to view and edit database records |
| `npx prisma db push` | Pushes the Prisma schema state to the database |

---

## 🛡️ Validation & Reliability Safeguards

- **Indian Geographic Constraints**: All business locations are verified against authoritative Indian state and district dictionaries. Any entry outside Indian boundaries or containing gibberish triggers an informative dialog asking the user to provide authentic location details.
- **Geospatial Recovery**: If network latency occurs during map tile or competitor rendering, interactive reload buttons allow immediate canvas recovery without losing user form state.
- **Secure Fallbacks**: When third-party microservices are offline, the application seamlessly switches to deterministic local mathematical models and conformal estimators.

---

## 🤝 Contributing

Contributions to VentureRoot are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
