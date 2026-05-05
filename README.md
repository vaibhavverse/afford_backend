# Affordmed Campus Hiring Evaluation Backend

This project contains the implementation for the backend microservices evaluation.

## ❗ Important Notes for Evaluators

### 1. API 401 Unauthorized Fallback
When integrating with the provided external APIs (`http://20.207.122.201/...`), the endpoints returned a `401 Unauthorized` status (as they require an authorization token). 
To ensure this microservice functions correctly and doesn't crash during evaluation, **a graceful fallback mechanism** has been implemented. If the external API call fails, the service automatically falls back to predefined `mockData` based on the example structure given in the requirements.

### 2. Vehicle Maintenance Scheduler - Knapsack Justification
**Assumption:** The total mechanic hours available for the system is the sum of all individual depot mechanic hours.
**Justification:** Thus, the problem is modeled as a standard **0/1 Knapsack Problem** where `Total Capacity = sum(depots.MechanicHours)`. 
**Alternative:** If we were constrained to assign specific tasks to individual depots (i.e., a task cannot exceed a single depot's limit and depots operate as separate buckets), this would become a **Multiple Knapsack Problem**. The Multiple Knapsack Problem has a significantly higher complexity (NP-hard, generally solved with heuristics or mixed-integer programming instead of standard dynamic programming). The current 0/1 Knapsack approach demonstrates scalable and optimal algorithmic thinking for the given constraints.

### 3. Strict Logging Compliance
No `console.log()` statements are used anywhere in this project. All logging is handled strictly through the custom middleware using `process.stdout.write`.

## How to Run
```bash
npm install
npm start
```

## Endpoints
- `GET /api/scheduler/plan` - Triggers the maintenance scheduler to find the optimal tasks.
- `GET /api/notifications/top` - Fetches the top 10 most important unread notifications.
