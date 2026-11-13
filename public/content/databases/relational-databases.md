---
title: Relational Databases & SQL
summary: Tables, keys and relationships, normalisation, joins, and transactions — ACID guarantees and isolation levels explained.
difficulty: beginner
tags: [sql, databases, relational, transactions, normalisation]
order: 1
related: [databases/choosing-a-database, databases/indexes, databases/entity-framework-core]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Relational Databases stub (no content).
---

A **relational database** stores data in **tables** of rows and columns, links tables through **keys**, and is queried with **SQL**. PostgreSQL, SQL Server, MySQL/MariaDB, Oracle and SQLite are all relational. It's the default choice for most business data, for good reason.

## Tables, keys and relationships

```sql
CREATE TABLE customers (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL
);

CREATE TABLE orders (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),   -- foreign key
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0)
);
```

- **Primary key:** uniquely identifies each row.
- **Foreign key:** references a row in another table. The database enforces **referential integrity**: no orders for customers that don't exist.
- **Constraints** (`NOT NULL`, `UNIQUE`, `CHECK`) put rules in the database, where no application bug can bypass them.

| Relationship | How it's modelled |
| --- | --- |
| One-to-many | Foreign key on the "many" side (`orders.customer_id`) |
| Many-to-many | A **junction table** (`order_lines` linking orders and products) |
| One-to-one | Foreign key that's also unique, or a shared primary key |

## Normalisation

**Normalisation** organises tables to avoid duplicated data and the update anomalies it causes:

- **1NF:** each column holds a single value; no repeating groups (no `phone1, phone2, phone3`).
- **2NF:** every non-key column depends on the *whole* primary key.
- **3NF:** non-key columns depend *only* on the key, not on other non-key columns. Store `customer_id`, not the customer's address, on each order.

A mnemonic for 3NF: every column depends on *the key, the whole key, and nothing but the key*.

**Denormalising** deliberately duplicates data for read performance, for example in reporting tables. Do it knowingly, with a plan for keeping copies in sync.

## Joins

```sql
SELECT c.name, o.id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.email LIKE '%@example.com';
```

| Join | Returns |
| --- | --- |
| `INNER JOIN` | Only rows with a match in both tables |
| `LEFT JOIN` | All rows from the left table, with NULLs where the right has no match |
| `RIGHT JOIN` | The mirror of LEFT |
| `FULL OUTER JOIN` | All rows from both, matched where possible |
| `CROSS JOIN` | Every combination (a Cartesian product) |

Aggregate with `GROUP BY`, and filter groups with `HAVING`:

```sql
SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 1000;
```

## Transactions and ACID

A **transaction** groups statements so they succeed or fail as a unit:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- or ROLLBACK on error: money is never lost halfway
```

- **Atomicity:** all or nothing.
- **Consistency:** constraints hold before and after.
- **Isolation:** concurrent transactions don't see each other's partial work (to a configurable degree).
- **Durability:** once committed, data survives crashes.

## Isolation levels

Stronger isolation prevents more anomalies but reduces concurrency:

| Level | Dirty read | Non-repeatable read | Phantom read |
| --- | --- | --- | --- |
| Read uncommitted | possible | possible | possible |
| Read committed | ✗ | possible | possible |
| Repeatable read | ✗ | ✗ | possible* |
| Serializable | ✗ | ✗ | ✗ |

\* Behaviour varies by engine. PostgreSQL's repeatable read also prevents phantoms.

- **Dirty read:** seeing another transaction's uncommitted changes.
- **Non-repeatable read:** re-reading a row and getting different values.
- **Phantom read:** re-running a query and getting new rows.

Most databases default to **read committed** (PostgreSQL, SQL Server, Oracle); MySQL's InnoDB defaults to repeatable read.

> [!WARNING]
> The classic concurrency bug is **read-modify-write**: two requests read stock = 1, both sell it, and stock ends at −1. Use an atomic update (`UPDATE … SET stock = stock - 1 WHERE stock > 0`), a row lock (`SELECT … FOR UPDATE`), optimistic concurrency (a version column), or serializable isolation.

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

````interview
Q: A query that used to be fast is now slow. How do you investigate?
A: Look at **what the database is actually doing**.
- Run `EXPLAIN` / `EXPLAIN ANALYZE` (or the actual execution plan) and look for full scans, poor row estimates, expensive sorts.
- Check indexes match the filters, joins and ordering; check for functions on indexed columns or implicit conversions.
- Consider data growth, stale statistics, parameter sniffing (SQL Server) and lock contention.
- From the application side: N+1 queries, fetching too many rows/columns, missing pagination.
- Fix, then measure again.

Q: Write a query to find customers who have never placed an order.
A: Use a **LEFT JOIN** and keep rows with no match, or `NOT EXISTS`:
```sql
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- equivalent, often clearer
SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```
Avoid `NOT IN` with a subquery that can return NULLs — it returns no rows.

Q: Two users try to buy the last item in stock at the same time. How do you prevent overselling?
A: Make the check and the update **atomic**.
- A conditional update: `UPDATE stock SET qty = qty - 1 WHERE product_id = @id AND qty > 0` and check rows affected.
- Or lock the row (`SELECT … FOR UPDATE` / `UPDLOCK`) inside a transaction, or use optimistic concurrency with a version column and retry on conflict.
- A `CHECK (qty >= 0)` constraint as a last line of defence.
- Never read, check in application code, then write in separate steps without one of these.

Q: When would you denormalise a database design?
A: When **read performance** matters more than write simplicity and you've measured a real problem.
- Examples: storing an order total, a precomputed count, a reporting table or materialised view, a read model for a busy page.
- Cost: duplicated data must be kept consistent (triggers, application logic, events) and writes become more complex.
- Normalise by default; denormalise deliberately, in specific places, with a plan for consistency.
````

```recall
Q: What do primary and foreign keys do?
A: A primary key uniquely identifies each row; a foreign key references another table's row, and the database enforces referential integrity.

Q: How is a many-to-many relationship modelled?
A: With a junction table holding foreign keys to both tables.

Q: What does third normal form (3NF) require?
A: Non-key columns depend on the key, the whole key, and nothing but the key — no dependencies between non-key columns.

Q: What's the difference between INNER JOIN and LEFT JOIN?
A: INNER JOIN returns only rows matched in both tables; LEFT JOIN returns all left-table rows, with NULLs where there's no match.

Q: What does ACID stand for?
A: Atomicity, Consistency, Isolation, Durability.

Q: What is a non-repeatable read?
A: Reading the same row twice in a transaction and getting different values because another transaction committed a change in between.
```
