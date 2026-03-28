# FairChance - Golf Charity Subscription Platform

<p align="center"> <b>A modern full-stack subscription platform with secure payments, admin control, and scalable architecture.</b> </p> <p align="center"> <a href="https://fair-chance-nine.vercel.app/">🌐 Live Demo</a> • <a href="https://github.com/vidit-ks/FairChance">📦 Repository</a> </p>
✨ Overview

FairChance is a production-style SaaS platform built to demonstrate real-world system design, combining subscription management, secure payment processing, and role-based user control.

The platform delivers a seamless experience where users can activate subscriptions, manage their activity, and interact with a dynamic dashboard, while administrators maintain full control over platform operations.

Designed with scalability and reliability in mind, FairChance integrates modern UI/UX practices with robust backend logic, ensuring a smooth and secure user journey.

🎯 Key Highlights
💳 Integrated Payment System
Secure Razorpay integration with verification and webhook-based synchronization
🔄 Hybrid Subscription Flow
Supports both automated payment activation and manual admin approval
📊 Dynamic User Dashboard
Real-time subscription tracking and optimized data handling
🛠️ Admin Command Center
Full control over users, approvals, and platform activity
⚡ Optimized Backend Logic
Efficient data constraints (latest 5 records logic) and scalable API design
🎨 Modern UI/UX
Clean, responsive interface built with Tailwind CSS
🧠 Core Functionality

FairChance enables users to:

Activate and manage subscriptions seamlessly
Track subscription status in real time
Interact with a structured scoring system
Experience a smooth, in-app payment flow

The system enforces optimized data handling by maintaining only the most relevant user data, ensuring performance and consistency.

💳 Subscription & Payment Flow

The platform implements a dual-layer subscription model:

🔹 Automated Flow
Payment processed via Razorpay
Secure verification of transactions
Webhook-based backend synchronization
Instant subscription activation
🔹 Manual Flow
Users can request offline approval
Admin reviews and approves/denies requests
Controlled activation with defined subscription lifecycle

This approach ensures both automation and flexibility.

🛠️ Admin Command Center

The administrative system provides:

Centralized user and subscription management
Real-time visibility of platform activity
Approval/denial workflows for subscription requests
Controlled access management for all users
⚙️ System Architecture
Frontend (React + Tailwind)
        ↓
Backend (Node.js + Express APIs)
        ↓
Database (Supabase)
        ↓
Payment Gateway (Razorpay)

The architecture is modular and scalable, following real-world production patterns.

🔐 Security & Reliability
Environment-based configuration for sensitive data
Secure payment verification mechanisms
Role-based access control for protected routes
Middleware-driven validation and authorization
🎨 UI Philosophy

FairChance follows a clean, modern, and minimal design approach, focusing on:

clarity and usability
smooth navigation
responsive layouts
consistent visual hierarchy
📌 Project Impact

FairChance demonstrates the ability to:

design and implement a real-world SaaS platform
integrate third-party payment systems securely
build scalable backend services
create intuitive and modern frontend experiences
👨‍💻 Author

Vidit Kumar Singh
Full-Stack Developer | AI & Cloud Enthusiast
