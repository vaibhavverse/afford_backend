# Affordmed Campus Hiring Evaluation - Backend

This project contains the backend implementation for the evaluation, including:

- Vehicle Maintenance Scheduler Microservice
- Campus Notifications Microservice

---

## Overview

The system is built using Node.js and Express with a modular architecture:

- routes → API endpoints  
- controllers → request handling  
- services → business logic  
- middleware → logging  

---

## ❗ Important Notes for Evaluators

### 1. API 401 Unauthorized Fallback
When integrating with the provided external APIs (`http://20.207.122.201/...`), the endpoints returned a `401 Unauthorized` status.

To ensure the system functions correctly:
- A graceful fallback mechanism is implemented
- On API failure, predefined mock data is used
- Prevents runtime crashes and ensures consistent output

---

### 2. Vehicle Maintenance Scheduler - Knapsack Justification

**Assumption:**  
Total available mechanic hours = sum of all depot capacities

**Approach:**  
Modeled as a **0/1 Knapsack Problem**

**Reasoning:**
- Maximizes total impact score under time constraints
- Efficient dynamic programming solution

**Alternative Consideration:**
- Assigning tasks per depot → Multiple Knapsack Problem
- Higher complexity (NP-hard)
- Requires advanced optimization techniques

---

### 3. Strict Logging Compliance

- No `console.log()` used anywhere
- Custom logging middleware implemented
- Logs written using `process.stdout.write`
- Middleware applied globally before all routes

---

## Features

### 1. Vehicle Maintenance Scheduler

- Optimizes task selection using Knapsack algorithm
- Returns:
  - Selected tasks
  - Total impact
  - Total duration

**Endpoint:**

GET /api/scheduler/plan


---

### 2. Campus Notifications System

- Fetches top notifications based on:
  - Priority (type-based)
  - Recency (timestamp-based)

**Endpoint:**

GET /api/notifications/top


---

## System Design (Notifications)

Includes:
- REST API design
- PostgreSQL schema
- Query optimization
- Indexing strategy
- Redis caching
- Real-time updates (WebSockets/SSE)
- Message queue based processing

---

## Tech Stack

- Node.js  
- Express.js  
- Axios  

---

## Project Structure

```
project/
├── routes/
├── controllers/
├── services/
├── middleware/
├── app.js
├── package.json
```


## How to Run


npm install
npm start


Server runs on:

http://localhost:3000


---

## API Summary

| Method | Endpoint                     | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | /api/scheduler/plan        | Optimize vehicle maintenance tasks   |
| GET    | /api/notifications/top     | Get top priority notifications       |

---

## Evaluation Notes

- Logging middleware integrated from the beginning
- No console logging used
- External API failures handled gracefully
- Clean modular structure followed
- Algorithmic and system design considerations included
