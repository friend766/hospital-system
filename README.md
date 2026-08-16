# Hospital & Pharmacy Management System — Hospital Portion

This project contains the assigned **Hospital & Patient Management** features of a two-person Next.js university project.

## Tech Stack
- **Framework**: Next.js (App Router, JavaScript `.js`/`.jsx`)
- **Styling**: Tailwind CSS with custom palette (`#2563EB` primary, `#0F172A` navy, `#F8FAFC` background) & Inter font
- **Database**: MongoDB + Mongoose cached connection (`lib/mongodb.js`)
- **Authentication**: JWT stored in secure HTTP-only cookies (`lib/auth.js`, `middleware.js`)

---

## 📌 Teammate Handoff & Boundary Notes

> [!IMPORTANT]
> **Pharmacy/billing/prescription features are NOT implemented — teammate's responsibility.**

1. **Shared Layout & App Shell**:
   - `components/layout/Sidebar.jsx` and `components/layout/Topbar.jsx` provide the generic role-based navigation.
   - A placeholder section for Pharmacy navigation is explicitly left open in `Sidebar.jsx`.

2. **User Model**:
   - `models/User.js` contains the system-wide user model supporting all 5 roles (`admin`, `doctor`, `receptionist`, `pharmacist`, `patient`).
   - Pharmacy-specific fields can be added under `models/User.js` where marked with `// TODO (teammate)`.

3. **Medical Records & Prescription Integration**:
   - `models/MedicalRecord.js` holds diagnosis, treatment, visit date, and clinical notes.
   - `app/(dashboard)/medical-records/[id]/page.jsx` contains a visible placeholder card and disabled button: **"+ Create Prescription (Teammate's Feature)"**.

4. **Excluded Files (Untouched for Teammate)**:
   - No `Medicine.js`, `Prescription.js`, `Inventory.js`, `Billing.js`, or `Invoice.js` models were created.
   - No `/medicines`, `/prescriptions`, `/inventory`, `/billing`, or `/pharmacist` pages or routes were built.

---

## Implemented Assigned Features

1. **Authentication & Access Control**: Register, Login, Logout, Role-based route protection (`middleware.js`).
2. **User Profile Management**: View & edit personal details (`/profile`, `/api/user/profile`).
3. **Patient Management**: Register patient, directory list with search/filter, detail view (`/patients`, `/patients/new`, `/patients/[id]`).
4. **Doctor Management**: Admin add doctor, department & specialty management, schedule availability (`/doctors`, `/doctors/new`, `/doctors/[id]`).
5. **Appointment Scheduling**: Book appointments, filter by status (`pending`, `confirmed`, `completed`, `cancelled`) & date (`/appointments`, `/appointments/new`).
6. **Medical & Diagnosis Records**: Record diagnosis, treatment, visit date, and notes (`/medical-records`, `/medical-records/new`, `/medical-records/[id]`).
7. **Role Dashboards**: Customized homepages for Admin, Doctor, Receptionist, and Patient (`/admin/dashboard`, `/doctor/dashboard`, `/receptionist/dashboard`, `/patient/dashboard`).
8. **In-App Notifications**: Toast notification banner system (`components/common/NotificationBanner.jsx`).

---

## Getting Started

1. Ensure `.env.local` contains valid credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
