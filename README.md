# Campus Events Information System — Frontend

A complete production-ready Next.js 14 frontend for the Campus Events Information System.

---

## 🚀 Quick Setup Guide

### Prerequisites

- **Node.js** v18 or higher (check: `node --version`)
- **npm** v9+ or yarn
- Your Django backend running on `http://localhost:8000`

---

### Step 1 — Install dependencies

Open a terminal inside this project folder and run:

```bash
npm install
```

This will install all packages listed in `package.json`, including Next.js, Tailwind CSS, Axios, Zod, and more.

---

### Step 2 — Create environment file

Create a `.env.local` file in the root of the project:

```bash
# Windows
copy .env.example .env.local

# Mac/Linux
cp .env.example .env.local
```

Then open `.env.local` and set your backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

If your backend runs on a different port, change it accordingly.

---

### Step 3 — Start the development server

```bash
npm run dev
```

Open your browser and visit: **http://localhost:3000**

---

### Step 4 — Build for production

```bash
npm run build
npm run start
```

---

## 🗂 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home page (/)
│   ├── login/page.tsx         # Login (/login)
│   ├── register/page.tsx      # Register (/register)
│   ├── forgot-password/       # Forgot password
│   ├── events/                # Public events listing
│   │   └── [id]/              # Single event detail
│   ├── support/               # Support ticket form
│   │
│   ├── dashboard/             # Student dashboard (STUDENT role only)
│   │   ├── layout.tsx         # Sidebar layout + RouteGuard
│   │   ├── page.tsx           # Dashboard home
│   │   ├── events/            # Browse events
│   │   ├── my-events/         # My registered events
│   │   ├── notifications/     # Notifications list
│   │   └── profile/           # Profile + password change
│   │
│   └── admin/                 # Admin panel (ADMIN role only)
│       ├── layout.tsx         # Admin sidebar layout + RouteGuard
│       ├── page.tsx           # Admin dashboard
│       ├── analytics/         # Full analytics page
│       ├── events/            # Manage events (CRUD)
│       ├── users/             # Manage users (approve/reject/role)
│       ├── categories/        # Manage categories (CRUD)
│       ├── registrations/     # View all registrations
│       ├── support/           # Manage support tickets
│       └── settings/          # System settings
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # Public top navigation
│   │   ├── Footer.tsx         # Public footer
│   │   ├── Sidebar.tsx        # DashboardSidebar + AdminSidebar
│   │   ├── AuthHydrator.tsx   # Hydrates auth from localStorage
│   │   └── RouteGuard.tsx     # Protects private routes
│   ├── events/
│   │   ├── EventCard.tsx      # Reusable event card
│   │   └── EventFilters.tsx   # Search + filter bar
│   └── ui/
│       ├── Button.tsx         # Reusable button (variants + loading)
│       ├── Input.tsx          # Input, Select, Textarea form fields
│       └── index.tsx          # Badge, Modal, Table, Pagination, etc.
│
├── services/                  # All API calls (Axios)
│   ├── api.ts                 # Axios instance + JWT interceptors
│   ├── authService.ts         # Login, register, logout
│   ├── eventService.ts        # Events CRUD + registration
│   ├── userService.ts         # Profile + admin user management
│   ├── notificationService.ts # Notifications
│   ├── supportService.ts      # Support tickets
│   └── adminService.ts        # Analytics, categories, settings
│
├── hooks/
│   ├── useAuth.ts             # Auth actions (login/logout)
│   ├── useEvents.ts           # Events with filters + register/cancel
│   └── useNotifications.ts    # Notifications + mark read
│
├── context/
│   └── authStore.ts           # Zustand auth store (global state)
│
├── types/
│   └── index.ts               # All TypeScript interfaces (no `any`)
│
└── utils/
    ├── constants.ts           # API URL, token keys, status colours
    └── helpers.ts             # Date formatting, error extraction, cn()
```

---

## 🔐 Authentication Flow

1. User logs in → JWT tokens stored in `localStorage`
2. Axios request interceptor adds `Authorization: Bearer <token>` to every request
3. On 401 response, the interceptor automatically refreshes the token
4. If refresh fails, user is redirected to `/login`
5. `RouteGuard` checks role before rendering protected pages
6. `AuthHydrator` reads localStorage on app mount to restore session

---

## 📄 Pages Summary

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home with featured events |
| `/events` | Public | Browse all events with filters |
| `/events/[id]` | Public | Event details + register button |
| `/login` | Public | Login form |
| `/register` | Public | Registration form |
| `/forgot-password` | Public | Forgot password request |
| `/support` | Public | Support ticket form |
| `/dashboard` | STUDENT | Dashboard home + stats |
| `/dashboard/events` | STUDENT | Browse + register for events |
| `/dashboard/my-events` | STUDENT | My registered events + cancel |
| `/dashboard/notifications` | STUDENT | Notifications + mark read |
| `/dashboard/profile` | STUDENT | Edit profile + change password |
| `/admin` | ADMIN | Admin dashboard + analytics |
| `/admin/analytics` | ADMIN | Full analytics report |
| `/admin/events` | ADMIN | Create/edit/delete events |
| `/admin/users` | ADMIN | Approve/reject/manage users |
| `/admin/categories` | ADMIN | Manage event categories |
| `/admin/registrations` | ADMIN | View all registrations |
| `/admin/support` | ADMIN | Respond to support tickets |
| `/admin/settings` | ADMIN | System settings |

---

## 🎨 Design System

- **Display font**: Playfair Display (headings)
- **Body font**: DM Sans (text)
- **Primary colour**: Blue (`#2563eb`)
- **Navy accent**: Deep navy for sidebars (`#0a0f23`)
- **Design approach**: Clean, institutional, professional

---

## 🔧 Troubleshooting

**"Cannot find module" errors after install:**
```bash
rm -rf node_modules .next
npm install
```

**CORS errors from backend:**
Make sure your Django backend has `corsheaders` configured to allow `http://localhost:3000`.

In Django `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

**Google Fonts not loading (offline):**
The fonts load from Google CDN. If you're offline, the fallback system fonts will be used automatically.

**API returning 401 on every request:**
Check that your Django JWT settings match. The default `ACCESS_TOKEN_LIFETIME` in simplejwt is 5 minutes. You can change it in `settings.py`:
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}
```
