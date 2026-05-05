# Campus Notifications Microservice - System Design & Analysis

## Stage 1: Design REST APIs for Notifications

### Endpoints
**1. Fetch Notifications (Paginated)**
- **Endpoint**: `GET /api/v1/notifications`
- **Query Params**: `page` (default 1), `limit` (default 20), `isRead` (boolean, optional)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "101",
      "type": "Placement",
      "message": "Microsoft Drive Tomorrow",
      "isRead": false,
      "timestamp": "2026-04-26T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "totalPages": 5, "totalItems": 100 }
}
```

**2. Mark Notification as Read**
- **Endpoint**: `PATCH /api/v1/notifications/:id/read`
- **Response**:
```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

---

## Stage 2: Database Choice & Schema

### Database Choice: PostgreSQL (SQL)
**Why?** Notifications are highly structured and strongly tied to relational entities (Students, Admin). Complex filtering and pagination (e.g., sorting by timestamps and filtering by `isRead`) are highly optimized in SQL with proper indexing.

### Schema Definition
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'Result', 'Placement', 'General'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast retrieval
CREATE INDEX idx_student_read_created ON notifications(student_id, is_read, created_at DESC);
```

### Problems & Scaling
- **Problem**: Table grows infinitely as notifications accumulate.
- **Scaling Solution**: 
  - **Archival Strategy**: Move notifications older than 30 days to cold storage or an analytical DB (like ClickHouse or S3) via background CRON jobs.
  - **Table Partitioning**: Partition the `notifications` table by date (e.g., weekly or monthly partitions).

---

## Stage 3: Query Optimization

### Query Analysis
**Original Query:**
```sql
SELECT * FROM notifications WHERE studentId = 1042 AND isRead = false ORDER BY createdAt DESC;
```
**Is it correct?** Yes, it logically returns unread notifications for a student.
**Why is it slow?**
1. **Missing Indexes**: Without a composite index, the database performs a full table scan, which is $O(N)$ and scales terribly.
2. **`SELECT *`**: Fetching all columns increases disk I/O and network payload size.

### Improved Query
```sql
-- Assumes the idx_student_read_created index is created
SELECT id, type, message, created_at 
FROM notifications 
WHERE studentId = 1042 AND isRead = false 
ORDER BY createdAt DESC;
```

### Placements in Last 7 Days
```sql
SELECT id, message, created_at 
FROM notifications 
WHERE type = 'Placement' 
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```
*(Requires index on `(type, created_at)`)*

---

## Stage 4: Solving Database Overload

### Problem: Notifications fetched on every page load causes DB overload.

### Solutions
1. **Caching Layer (Redis)**: 
   - Store the unread notification count and the top 10 recent notifications in Redis (`Key: notifications:student_id:1042`).
   - On page load, fetch from Redis ($O(1)$) instead of DB. Invalidate/update cache when a new notification is inserted.
2. **WebSockets or Server-Sent Events (SSE)**:
   - Instead of polling or querying on page load, maintain an active connection and push notifications to the client instantly.

### Trade-offs
- **Redis Cache**: 
  - *Pros*: Extremely fast, simple to implement. 
  - *Cons*: Eventual consistency; cache invalidation logic adds complexity.
- **WebSockets**: 
  - *Pros*: Real-time, zero DB queries on page load. 
  - *Cons*: Heavy memory usage on the server for maintaining active connections; complex load-balancing.

---

## Stage 5: Pseudocode Optimization

### Current Issues
```text
function notify_all(student_ids, message) {
  for student_id in student_ids:
      send_email(student_id, message)      // Blocking I/O
      save_to_db(student_id, message)      // 1-by-1 DB Insert (Slow)
      push_to_app(student_id, message)     // Blocking I/O
}
```
1. **Synchronous/Blocking**: Everything runs sequentially. If `send_email` takes 2 seconds and fails, the loop halts, and subsequent students get nothing.
2. **N+1 DB Inserts**: Doing an insert inside a loop overloads the DB connection pool.

### Optimization Strategy
- **Reliability**: Use a Message Queue (e.g., RabbitMQ, AWS SQS) for email and push notifications to decouple delivery from execution. Implement automatic retries.
- **Speed**: Use bulk database inserts.

### Improved Pseudocode
```javascript
async function notify_all(student_ids, message) {
  // 1. Bulk Insert into Database (Fast)
  const notificationRecords = student_ids.map(id => ({ student_id: id, message }));
  await db.bulkInsert('notifications', notificationRecords);

  // 2. Publish to Asynchronous Message Queues (Decoupled & Fast)
  // Workers listening to these queues will handle the actual delivery with retries.
  for (const student_id of student_ids) {
      await messageQueue.publish('email_queue', { student_id, message });
      await messageQueue.publish('push_queue', { student_id, message });
  }
}
```
*Note: Queue publishing can also be batched if the message broker supports it.*
