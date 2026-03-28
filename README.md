# FairChance - Golf Charity Subscription Platform

**FairChance**

A full-stack subscription platform built with secure payment integration, role-based access control, and scalable backend architecture, designed to simulate a real-world SaaS system.

📖 **Overview**

FairChance is a production-style SaaS platform that combines subscription management, payment processing, and administrative control into a unified system.

The platform enables users to subscribe, manage their activity, and interact with a structured dashboard, while administrators maintain centralized control over user access and platform operations.

It is designed with a strong focus on:

real-world architecture
secure payment workflows
scalable backend logic
clean and responsive UI


⚙️**System Architecture**

        User Interface (React + Tailwind)
                    │
                    ▼
        API Layer (Node.js + Express)
                    │
                    ▼
        Database (Supabase)
                    │
                    ▼
        Payment Gateway (Razorpay)

Key idea: Each layer is modular and independent, making the system scalable and maintainable.

**Core Features**

🔐 **Authentication & Roles**

Secure login/signup system
Role-based access (User / Admin)
Protected routes using middleware

💳 **Subscription System**
Monthly and yearly plans
Dual flow:
Automated payment (Razorpay)
Manual admin approval
Subscription states:
inactive
pending_payment
pending_approval
active

📊** User Dashboard**
Real-time subscription tracking
Score management system
Latest 5 records logic (optimized data storage)
Dynamic UI updates based on user state

🛠️**Admin Command Center**
View and manage all users
Approve or reject subscription requests
Monitor subscription states and activity
Control access to platform features

💰 **Payment Integration**
Razorpay checkout (test mode)
Secure payment verification
Backend-controlled activation logic
Webhook-ready architecture for real-time updates

**Subscription Flow**

**Automated Payment Flow**

User clicks "Activate Plan"
        ↓
Backend creates Razorpay order
        ↓
Razorpay Checkout opens
        ↓
Payment Success
        ↓
Backend verifies payment
        ↓
Subscription → ACTIVE
        ↓
Dashboard unlocked


**Manual Approval Flow**

User requests subscription
        ↓
Status → PENDING_APPROVAL
        ↓
Admin reviews request
        ↓
Admin approves
        ↓
Subscription → ACTIVE


📊 **Data Handling Strategy**

Only latest 5 records per user are stored
Prevents unnecessary data growth
Ensures consistent performance and faster queries
Maintains relevance of user activity


🔐 **Security & Reliability**

Sensitive data handled via environment variables
Payment verification ensures transaction authenticity
Role-based access control protects critical routes
Middleware enforces subscription-based restrictions


🎨 **UI & Experience**

The platform follows a clean and modern design philosophy:

Minimal clutter with strong visual hierarchy
Responsive layout across devices
Smooth navigation and state transitions
Dashboard-focused user experience


👨‍💻 **Author**
Vidit Kumar Singh
Full-Stack Developer
