# HealthCare+ — Patient Account Module (Frontend Prototype)

A calm, accessible, modular 3-page frontend prototype of the **Patient Account** section for a hospital/healthcare web application (built as one of three modules in a university group project).

> **Prototype Disclaimer:** Authentication, appointments, and profile persistence are simulated locally in the browser using `localStorage` and fictional sample data. Do not enter real medical, financial, or sensitive personal data.

## Pages Included
1. **`index.html` — Login / Sign Up:** Single authentication screen with smooth tab switching, inline field validation, visible password requirements, show/hide password toggles, "Remember me", "Forgot Password?" modal demo, and instant Demo Patient Account access.
2. **`dashboard.html` — Patient Dashboard:** Personalized greeting (`Welcome back, [Patient Name]`), upcoming appointment cards with a "View details" modal, 4 interactive quick action cards (*Book an Appointment*, *View All Appointments*, *Edit My Profile*, *Contact Support*), and a dynamic Recent Activity timeline.
3. **`profile.html` — My Profile:** Patient header with avatar & fictional Patient ID (`HC-2025041`), Personal Information, Contact Information, Account Settings (*Change Password* modal demo), and explicit *Edit / Save Changes / Cancel* workflow synced across the portal.

## Running Locally (Windows Fix for `http://[::]:8080/`)
Do **not** open `http://[::]:8080/` in Edge/Chrome (Windows rejects `[::]` as `ERR_ADDRESS_INVALID`). Always bind to `127.0.0.1` or open `http://localhost:8080/index.html`:

Option A — Double-click **`start-server.bat`** in this folder (automatically launches `http://127.0.0.1:8080/index.html`).

Option B — Run in PowerShell / Terminal:
```powershell
python -m http.server 8080 -b 127.0.0.1
```
Then open **`http://127.0.0.1:8080/index.html`** or **`http://localhost:8080/index.html`**.

Option C — Double-click **`index.html`** directly in File Explorer.

## Demo Credentials
- **Email:** `sarah.johnson@email.com`
- **Password:** `CarePortal2026!`
