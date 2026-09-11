# 🚀 MERN Job Portal Application

A full-stack Job Portal platform built using the MERN stack (MongoDB, Express.js, React, Node.js) with Vite. Features unified deployment on Vercel with automated client-side routing and relative API endpoints.

---

## 🚀 Live Demo

* **Live Application:** [https://job-portal-tra3.vercel.app](https://job-portal-tra3.vercel.app)

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, JavaScript (ES6+), CSS3
* **Backend:** Node.js, Express.js, JWT Authentication
* **Database:** MongoDB (Mongoose ORM)
* **Deployment & Hosting:** Vercel (Unified Monorepo Architecture)

---

## ✨ Key Features

* 🔐 **Role-Based Authentication:** Multi-user authentication for Candidates and Employers/Recruiters.
* 📋 **Job Opportunities:** Employers can post, edit, and manage job listings.
* 📄 **Application Tracking:** Candidates can apply to jobs and monitor application timelines.
* 📊 **Interactive Dashboards:** Separate Candidate and Recruiter dashboards for managing applications and profiles.
* 🌐 **Unified Monorepo Setup:** Single Vercel deployment serving both REST API endpoints and dynamic React routes.

---

## 📦 Project Structure

```text
job_portal/
│
├── 📁 backend/
│   ├── 📁 controllers/
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   └── opportunityController.js
│   ├── 📁 middleware/
│   │   ├── auth.js
│   │   └── authMiddleware.js
│   ├── 📁 models/
│   │   ├── Application.js
│   │   ├── Opportunity.js
│   │   └── User.js
│   ├── 📁 routes/
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   └── opportunityRoutes.js
│   ├── 📁 uploads/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── seed.js
│   └── server.js
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── 📁 src/
│   │   ├── 📁 assets/
│   │   │   ├── hero.png
│   │   │   └── react.svg
│   │   ├── 📁 components/
│   │   │   ├── ApplicantsModal.jsx
│   │   │   ├── ApplicationTimeline.css
│   │   │   ├── ApplicationTimeline.jsx
│   │   │   ├── ApplyModal.jsx
│   │   │   ├── EmployerCandidateModal.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Navbar.jsx
│   │   │   └── PostJobForm.jsx
│   │   ├── 📁 pages/
│   │   │   ├── Auth.jsx
│   │   │   ├── CandidateApplications.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── EditPreferences.jsx
│   │   │   ├── EditResume.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── RecruiterApplicationModal.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   └── Register.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── .oxlintrc.json
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── vercel.json
└── README.md