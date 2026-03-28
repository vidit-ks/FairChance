# FairChance - Golf Charity Subscription Platform

FairChance

A full-stack subscription platform with secure payment integration, role-based access control, and scalable architecture.

Live: https://fair-chance-nine.vercel.app/

Repository: https://github.com/vidit-ks/FairChance

Overview

FairChance is a production-oriented SaaS platform designed to demonstrate real-world system design, combining subscription management, payment processing, and administrative control.

The platform enables users to activate subscriptions, manage their activity through a dashboard, and interact with a structured system, while administrators retain centralized control over access and operations.

Key Features
Subscription System: Supports monthly and yearly plans with both automated payment activation and manual admin approval
Payment Integration: Razorpay-based checkout with secure verification and backend synchronization
User Dashboard: Real-time subscription tracking with optimized data handling (latest 5 records logic)
Admin Control Panel: Manage users, approve or deny requests, and monitor platform activity
Backend Architecture: RESTful APIs with middleware for authentication, authorization, and access control
Modern UI: Responsive interface built with React and Tailwind CSS
Core Functionality

Users can:

Activate and manage subscriptions
Track subscription status in real time
Interact with a structured scoring system
Access features based on subscription state

The system enforces efficient data constraints, maintaining only the most relevant records per user to ensure performance and consistency.

Subscription and Payment Flow

Automated Flow

User initiates payment through Razorpay
Payment is verified securely
Backend updates subscription status
Dashboard unlocks automatically

Manual Flow

User requests offline approval
Admin reviews and approves or rejects
Subscription is activated with defined validity
System Architecture
Frontend (React + Tailwind)
        ↓
Backend (Node.js + Express)
        ↓
Database (Supabase)
        ↓
Payment Gateway (Razorpay)

The system follows a modular and scalable design, aligned with real-world backend and API practices.

Security and Reliability
Sensitive data managed through environment variables
Secure payment verification implemented
Role-based access control for protected routes
Middleware-driven request validation
Project Highlights
Built a complete full-stack application with real-world architecture
Integrated a third-party payment gateway with verification and lifecycle handling
Designed a hybrid subscription model (automated + manual)
Developed admin-driven workflows for controlled access
Author

Vidit Kumar Singh
Full-Stack Developer
