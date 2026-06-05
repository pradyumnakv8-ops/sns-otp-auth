# SNS OTP Auth — React Frontend

A production-ready React 18 frontend with mobile OTP authentication powered by **AWS SNS** (via a secure backend API) and **JWT** session management. Deployable to **AWS Amplify** with zero configuration.

---

## Architecture (Microservice)

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│           (AWS Amplify — this repository)                │
│                                                         │
│  Login Page  →  authService.js  →  Axios apiClient      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (JWT in headers)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Microservice  (Backend)                │
│         API Gateway  +  AWS Lambda  +  DynamoDB          │
│                                                         │
│  POST /api/auth/send-otp   → invokes AWS SNS → SMS      │
│  POST /api/auth/verify-otp → validates OTP  → JWT       │
└─────────────────────────────────────────────────────────┘
```

> **Security principle:** React never calls AWS SNS directly. All AWS credentials live in the backend Lambda — React only calls your API Gateway endpoint.

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Top navigation with logout
│   ├── Loader.jsx          # Full-screen loading overlay
│   ├── ProtectedRoute.jsx  # Route guard (redirects if no JWT)
│   ├── OTPInput.jsx        # 6-box OTP input with paste support
│   └── CountdownTimer.jsx  # 60s resend countdown
├── pages/
│   ├── Login.jsx           # Mobile input + OTP verification
│   ├── Dashboard.jsx       # Authenticated landing page
│   └── Profile.jsx         # User detail page
├── context/
│   └── AuthContext.jsx     # Global auth state (login/logout)
├── services/
│   ├── apiClient.js        # Axios instance + JWT interceptors
│   └── authService.js      # send-otp / verify-otp API calls
├── routes/
│   └── AppRoutes.jsx       # Public + protected route definitions
├── hooks/
│   └── useAuth.js          # Convenience hook for AuthContext
├── App.jsx                 # BrowserRouter + AuthProvider root
└── main.jsx                # ReactDOM entry point
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
```

### 3. Run locally
```bash
npm run dev
# → http://localhost:3000
```

### 4. Production build
```bash
npm run build
# output in /dist
```

---

## API Contract

### POST `/api/auth/send-otp`
```json
// Request
{ "mobileNumber": "+919876543210" }

// Success
{ "success": true, "message": "OTP sent successfully" }

// Error
{ "success": false, "message": "Failed to send OTP" }
```

### POST `/api/auth/verify-otp`
```json
// Request
{ "mobileNumber": "+919876543210", "otp": "123456" }

// Success
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "1", "name": "John Doe", "mobileNumber": "+919876543210", "role": "User" }
}

// Error
{ "success": false, "message": "Invalid OTP" }
```

---

## Authentication Flow

1. User enters country code + mobile number → clicks **Send OTP**
2. Frontend calls `POST /api/auth/send-otp` → backend triggers **AWS SNS SMS**
3. User enters the 6-digit OTP → clicks **Verify OTP**
4. Frontend calls `POST /api/auth/verify-otp` → backend returns **JWT**
5. JWT + user stored in `sessionStorage`
6. All subsequent requests include `Authorization: Bearer <token>` via Axios interceptor
7. 401 response → automatic logout + redirect to `/login`

---

## Deploy to AWS Amplify

### Option A — Console (recommended)
1. Push this repo to GitHub / CodeCommit / Bitbucket
2. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click **New app → Host web app** → connect your repo
4. Amplify auto-detects `amplify.yml` — build settings are pre-configured
5. Add environment variable: `VITE_API_BASE_URL = https://your-backend.com`
6. Click **Save and deploy**

### Option B — Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

### Rewrite Rule (SPA routing)
Add this in **Amplify Console → App settings → Rewrites and redirects**:

| Source address | Target address | Type            |
|----------------|----------------|-----------------|
| `/<*>`         | `/index.html`  | 200 (Rewrite)   |

Or as JSON:
```json
[{ "source": "/<*>", "target": "/index.html", "status": "200" }]
```

---

## Session Management

| Action  | Behaviour                                         |
|---------|---------------------------------------------------|
| Login   | `sessionStorage.setItem('token', jwt)`            |
| Refresh | Session restored from `sessionStorage` on mount   |
| Logout  | `sessionStorage.clear()` + redirect `/login`      |
| 401     | Axios interceptor auto-clears session + redirects |
| Tab close | Session automatically cleared by browser       |

---

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | React 18 + Vite 5           |
| Routing     | React Router v6             |
| HTTP client | Axios with interceptors      |
| Auth state  | React Context API           |
| Styling     | Pure CSS (design tokens)    |
| Deployment  | AWS Amplify                 |
| OTP delivery| AWS SNS (via backend only)  |
