---
title: Database Indexes
summary: How B-tree indexes turn full table scans into fast lookups, how composite indexes are ordered, and what indexes cost you on writes.
difficulty: intermediate
tags: [sql, databases, performance, indexes]
order: 1
related: [fundamentals/data-structures, fundamentals/big-o-notation, backend/rest-api-design]
---

Without an index, finding rows means reading every row — a **full table scan**, `O(n)`. An index is a separate, sorted data structure that lets the database jump straight to matching rows in roughly `O(log n)`.

## How a B-tree index works

Most relational indexes are **B-trees** (strictly, B+ trees): wide, shallow, balanced trees whose leaves hold keys in sorted order with pointers to the rows. A table with a billion rows typically needs only 3–4 levels, so a lookup touches just a few pages.

Because keys are sorted, the same index serves:

- equality: `WHERE email = 'a@b.com'`
- ranges: `WHERE created_at >= '2026-01-01'`
- sorting: `ORDER BY created_at` (no separate sort step)
- prefix matches: `WHERE name LIKE 'Ada%'` — but **not** `LIKE '%ada'`

## Composite indexes and column order

```sql
CREATE INDEX idx_orders_customer_date ON orders (customer_id, created_at);
```

This is sorted by `customer_id`, then by `created_at` within each customer. Think of a phone book sorted by surname, then first name.

| Query | Uses the index? |
| --- | --- |
| `WHERE customer_id = 7` | ✅ leftmost column |
| `WHERE customer_id = 7 AND created_at > '2026-06-01'` | ✅ both columns |
| `WHERE customer_id = 7 ORDER BY created_at DESC` | ✅ filter + sort |
| `WHERE created_at > '2026-06-01'` | ❌ skips the leftmost column |

> [!TIP]
> Order composite columns as **equality filters first, then range or sort columns**.

## Covering indexes

If the index contains every column the query needs, the database never touches the table ("index-only scan"):

```sql
CREATE INDEX idx_orders_cover ON orders (customer_id, created_at) INCLUDE (total);
SELECT created_at, total FROM orders WHERE customer_id = 7;
```

## The costs

- **Writes get slower** — every `INSERT`, `UPDATE` of an indexed column and `DELETE` must update each index.
- **Storage** — indexes can rival the table in size.
- **Low-selectivity columns** (e.g. a boolean) rarely benefit; the planner may scan anyway.

## Things that silently defeat an index

```sql
-- ❌ Function on the indexed column
WHERE LOWER(email) = 'ada@example.com'
-- ✅ Index the expression instead (or store normalised data)
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- ❌ Implicit type conversion (comparing a varchar column to a number)
WHERE phone = 5551234
```

## Verify with EXPLAIN

Never guess — ask the planner:

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7;
```

Look for `Index Scan` / `Index Only Scan` versus `Seq Scan`, and compare estimated with actual row counts.

> [!AI]
> AI-written ORM code often hides an N+1 query (one query per row inside a loop) or filters in application memory after fetching everything. Turn on query logging in development and look at what actually hits the database.

```recall
Q: Why can a composite index on (customer_id, created_at) not serve `WHERE created_at > X` alone?
A: The index is sorted by customer_id first; without filtering on the leftmost column, the matching created_at values are scattered across the whole index.

Q: What is a covering index?
A: An index that contains all the columns a query needs, so the database can answer it from the index alone without reading the table.

Q: What's the main cost of adding indexes?
A: Slower writes (every index must be maintained on insert/update/delete) and extra storage.

Q: Why does `WHERE LOWER(email) = ...` skip a normal index on email?
A: The index stores raw email values; applying a function to the column means the sorted keys can't be used. Use an expression index instead.
```
