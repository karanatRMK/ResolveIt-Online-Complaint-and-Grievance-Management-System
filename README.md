# 🚀 ResolveIt – Online Complaint and Grievance Management System

## 📖 Overview

**ResolveIt** is a full-stack web application that streamlines complaint and grievance handling through a secure, role-based workflow. Built with **React.js**, **Spring Boot**, and **MySQL**, the system enables users to submit complaints online while allowing employees and administrators to efficiently manage, track, and resolve them.

---

## 🌟 Key Features

### 👤 User

* Register and login using JWT authentication
* Submit complaints with file attachments
* Track complaint status in real time
* View complaint history
* Browse public complaints

### 👨‍💼 Employee

* View assigned complaints
* Update complaint status
* Add comments and resolution details

### 👨‍💼 Senior Employee

* Monitor escalated complaints
* Manage complaint assignments
* Supervise complaint resolution

### 👨‍💻 Administrator

* Manage users and employee roles
* Monitor all complaints
* Approve employee requests
* Track complaint analytics

---

## 🛠 Tech Stack

| Layer          | Technologies                      |
| -------------- | --------------------------------- |
| Frontend       | React.js, Bootstrap, Vite         |
| Backend        | Spring Boot, Spring Security, JWT |
| Database       | MySQL, Hibernate (JPA)            |
| Authentication | JWT (JSON Web Token)              |
| Notifications  | Gmail SMTP                        |
| Build Tool     | Maven                             |

---

## 🔐 Core Functionalities

* JWT-based Authentication & Authorization
* Role-Based Access Control (RBAC)
* Complaint Submission & Tracking
* Complaint Assignment & Status Updates
* Automated Complaint Escalation
* Email Notifications
* File Attachment Support
* Public Complaint Portal
* Responsive User Interface

---

## ⚙️ Application Flow

1. Users register and log in securely.
2. Complaints are submitted with relevant details and attachments.
3. Employees review and update complaint status.
4. Senior Employees manage escalated complaints.
5. Administrators oversee users, complaints, and system operations.

---

## ▶️ Getting Started

### Prerequisites

* Java 17+
* Node.js & npm
* MySQL
* Maven

### Run the Application

```bash
# Backend
mvn spring-boot:run

# Frontend
npm install
npm run dev
```

Backend: **http://localhost:8081**

Frontend: **http://localhost:3000**

---

## 📈 Future Enhancements

* SMS notifications
* Mobile application
* AI-powered complaint categorization
* Analytics dashboard
* Real-time notifications using WebSockets

---

## 📌 Use Cases

* Educational Institutions
* Corporate Organizations
* Government Grievance Portals
* Hostel & Residential Management
* Customer Support Systems
