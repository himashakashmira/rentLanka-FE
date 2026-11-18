# 🇱🇰 RentLanka - Frontend Web Application

> **ITS2020 - Rapid Application Development (RAD) | Final Coursework Assignment**  
> **Graduate Diploma in Software Engineering (GDSE)**  
> **Institute of Software Engineering (IJSE)**  
> **Module Lecturer:** Mr. Shamodha Sahan  
> **Student Name:** Himasha Kashmira  

---

## 🌐 Live Deployment & Source Code Links
- **🚀 Live Production Web Application:** [https://rentlanka-fe.vercel.app/](https://rentlanka-fe.vercel.app/)
- **⚡ Live Backend API:** [https://rent-lanka-be.vercel.app/](https://rent-lanka-be.vercel.app/)
- **📦 Frontend Repository:** [https://github.com/himashakashmira/rentLanka-FE.git](https://github.com/himashakashmira/rentLanka-FE.git)
- **📦 Backend Repository:** [https://github.com/himashakashmira/rentLanka-BE.git](https://github.com/himashakashmira/rentLanka-BE.git)

---

## 📖 1. Project Overview
**RentLanka** is a modern, responsive, full-stack peer-to-peer (P2P) and B2C rental marketplace engineered specifically for the Sri Lankan economy. The platform enables individuals and local enterprises to rent out underutilized vehicles (cars, SUVs, dual-sport bikes), heavy plant machinery (excavators, backhoes), broadcast-grade cinema gear, industrial power generators, and event staging equipment.

Built with **React, TypeScript, Redux Toolkit, and Tailwind CSS**, the client application embodies user-centric design, robust state management, and strict type safety as mandated by the ITS2020 coursework guidelines.

---

## ✨ 2. Key Features & Workflows
- **Dynamic Asymmetric Homepage:** Real-time search panel with multi-tier filters (City/Hub, Category, and Date range) and curated category tiles.
- **Searchable Sri Lankan City Selector:** Autocomplete dropdown featuring major regional hubs across Southern, Western, Central, and Northern provinces (Beliatta, Tangalle, Matara, Galle, Colombo, Kandy, etc.).
- **2-Step Category-Aware Asset Listing Form:** Dynamic form fields that adapt based on category (e.g., Transmission/Fuel/Seats for Vehicles vs. Sensor/Lenses for Cameras).
- **Automated Gemini AI Description Generator (Section 6.5 Advanced Feature):** One-click button that generates customized, persuasive rental marketing copy using Google's Gemini generative AI model.
- **Interactive Checkout & Escrow Payment Modal:** Simulated LankaPay/Visa escrow gateway with auto-filled sandbox test card (`4242 •••• •••• 4242`) and real-time cost breakdown.
- **Operations & Admin Dashboard:** Command center for platform oversight—review live booking requests, approve or decline reservations, and monitor system health telemetry.
- **Protected Actions & Role-Based Auth:** Unauthorized guests are seamlessly intercepted and prompted to log in before creating a listing or confirming a rental booking.
- **100% Mobile Responsive:** Custom sliding navigation drawer engineered for mobile and tablet touchscreens.

---

## 🛠️ 3. Technologies & Tools Used
| Layer | Technology |
|---|---|
| **Framework / Library** | React 18+ (Functional Components & Hooks) |
| **Language** | TypeScript (`.tsx`) |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) |
| **Styling** | Tailwind CSS (Ceylon Emerald `#006948` theme) |
| **Icons** | Lucide React |
| **Client-Side Routing** | React Router v6 / v7 (`react-router-dom`) |
| **Build Tooling** | CRACO (Create React App Configuration Override) |
| **Deployment Platform** | Vercel Serverless Global Edge Network |

---

## 📂 4. Project Folder Structure
```text
rentlanka-fe/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── store.ts            # Central Redux Store configuration
│   │   └── slices/             # Redux Slices (authSlice, bookingSlice)
│   ├── assets/                 # Brand logos and photographic assets
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Responsive header with mobile hamburger drawer
│   │   │   ├── AppShell.tsx    # Layout boundary wrapper
│   │   │   └── Footer.tsx      # Official Sri Lankan business footer
│   │   └── ui/
│   │       ├── RentalCard.tsx  # Dynamic rental item card
│   │       └── PaymentModal.tsx# LankaPay escrow checkout modal
│   ├── pages/
│   │   ├── HomePage.tsx        # Hero, category grid, live fleet highlights
│   │   ├── ExplorePage.tsx     # Full search catalog with price & availability filters
│   │   ├── CategoriesPage.tsx  # 8-Sector visual equipment showcase
│   │   ├── RentalDetailsPage.tsx # Gallery showcase, price calculator, booking CTA
│   │   ├── ListItemPage.tsx    # 2-Step category listing form with AI assist
│   │   ├── AdminDashboardPage.tsx # Operations hub with booking approval workflow
│   │   ├── HowItWorksPage.tsx  # 3-Step Renter & Host guide
│   │   └── AuthPage.tsx        # Unified Login, Register & Password Reset
│   ├── services/
│   │   └── api.ts              # Centralized typed REST client
│   ├── styles/
│   │   └── marketplace.css     # Custom animations & glassmorphic classes
│   ├── types/
│   │   └── index.ts            # Shared TypeScript domain interfaces
│   ├── App.tsx                 # Route mapping
│   ├── index.css               # Tailwind CSS directives
│   └── index.tsx               # Root DOM mounting
├── .npmrc                      # Legacy peer-deps configuration
├── tailwind.config.js          # Extended brand color definitions
├── tsconfig.json               # TypeScript compiler rules
└── package.json

🚀 5. Local Setup & Execution Instructions
Prerequisites

Node.js (v18.0.0 or higher)
npm or yarn
Git

Installation Steps

Bash
# 1. Clone the frontend repository
git clone https://github.com/himashakashmira/rentLanka-FE.git

# 2. Navigate to project root
cd rentLanka-FE

# 3. Install dependencies using legacy peer dependencies
npm install --legacy-peer-deps

# 4. Create an environment file (.env) in the root directory:
REACT_APP_API_URL=https://rent-lanka-be.vercel.app/api/v1

# 5. Launch local development server
npm start

The application will be accessible at http://localhost:3000.

🔑 6. Assessment & Evaluation Accounts

For course grading and presentation demos, pre-seeded accounts are available:

Role	Email Address	Password	Permissions
Admin (Operations)	admin@rentlanka.lk	Admin@1234	Full platform control, moderation, approval workflow
Host (Owner)	himashawaduge58@gmail.com	kamal123	Create listings, manage asset fleet
Customer (Renter)	wadugehimasha@gmail.com	kapila123	Browse, calculate pricing, reserve rentals

👨‍💻 Author & Contact

Developer: Himasha Kashmira
Institution: Institute of Software Engineering (IJSE) - Galle / Panadura
Email: himashakashmira7@gmail.com
WhatsApp / Mobile: +94 78 360 4911