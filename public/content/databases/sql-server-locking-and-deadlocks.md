---
title: SQL Server Locking, Blocking & Deadlocks
summary: Lock types and escalation, diagnosing a blocking chain, how deadlocks are resolved, and READ_COMMITTED_SNAPSHOT — where Azure SQL's default differs from on-prem.
difficulty: advanced
tags: [sql, mssql, tsql, databases, performance, concurrency]
order: 6
related: [databases/relational-databases, databases/tsql-essentials, databases/sql-server-execution-plans, azure/azure-sql-database]
status: needs-review
reviewNotes: New entry for the SQL Server batch. The RCSI default difference (Azure SQL Database ON vs on-prem/VM OFF) was verified fresh against the current T-SQL reference on 2026-11-21.
---

Two symptoms, two different problems: **blocking** is one transaction waiting for another to finish — normal, and usually resolves itself. A **deadlock** is two transactions each waiting for the other — neither can resolve itself, and SQL Server has to intervene.

## Lock types, briefly

| Lock | Meaning |
| --- | --- |
| **Shared (S)** | Reading; compatible with other shared locks |
| **Exclusive (X)** | Writing; incompatible with everything |
| **Update (U)** | "I might upgrade to exclusive" — prevents two readers both trying to become writers and deadlocking each other |
| **Intent (IS/IX)** | A "heads up" at a coarser level (page/table) that a more granular lock is held below it |

SQL Server takes locks at row, page or table granularity, choosing based on how many rows are touched. **Lock escalation** converts many row/page locks into one table lock (by default, around 5,000 locks on one object) to save memory — which can suddenly block readers that were fine a moment earlier.

## Diagnosing a blocking chain

```sql
SELECT
    r.session_id, r.blocking_session_id, r.wait_type, r.wait_time,
    t.text AS QueryText
FROM sys.dm_exec_requests r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE r.blocking_session_id <> 0;
```

This shows who's blocked and who's blocking them. Follow `blocking_session_id` back far enough and you find the **lead blocker** — often an uncommitted transaction left open (a forgotten `COMMIT`, or an interactive session with a transaction started and the developer stepped away).

`sys.dm_tran_locks` shows the actual locks held; `sp_whoisactive` (a well-known community script, not built in) presents the same information more readably than the raw DMVs.

> [!TIP]
> The most common "SQL Server is locking up" incident isn't a deadlock at all — it's one long-running or forgotten transaction holding locks while everything else queues behind it. Check for open transactions first.

## Deadlocks

When two transactions each hold a lock the other needs, SQL Server detects the cycle and picks a **deadlock victim** — usually the transaction that's cheaper to roll back — kills it with error 1205, and lets the other proceed.

```sql
-- Turn on deadlock graph capture in the Extended Events system_health session (on by default),
-- or create a dedicated session to capture them going forward.
SELECT xet.target_data
FROM sys.dm_xe_session_targets xet
JOIN sys.dm_xe_sessions xe ON xe.address = xet.event_session_address
WHERE xe.name = 'system_health';
```

**Application-side**, always catch error 1205 and retry the transaction — a deadlock victim is not a bug to fix by "never deadlocking", it's an expected outcome your code should handle:

```csharp
for (var attempt = 0; attempt < 3; attempt++)
{
    try { await PlaceOrderAsync(); break; }
    catch (SqlException ex) when (ex.Number == 1205 && attempt < 2) { await Task.Delay(50 * (attempt + 1)); }
}
```

**Reducing deadlock frequency:** access tables in a **consistent order** across your codebase, keep transactions as short as possible, and add indexes that let statements find and lock only the rows they need instead of scanning and locking more than necessary.

## READ_COMMITTED_SNAPSHOT: the default that differs on Azure

Under the default **READ COMMITTED** isolation level, SQL Server normally takes **shared locks** for reads, so readers can block writers and vice versa. **READ_COMMITTED_SNAPSHOT (RCSI)** changes this: readers see a transactionally consistent **row-versioned snapshot** instead of taking locks, so readers no longer block writers (and vice versa) — at the cost of `tempdb` storing the version store.

> [!WARNING]
> **Azure SQL Database defaults to RCSI ON.** On-premises SQL Server and SQL Server on an Azure VM default to **OFF**. An application that unknowingly depends on read-locking behaviour (for correctness, not just performance) can behave subtly differently after a migration in either direction — this is one of the most-cited surprises when moving between on-prem SQL Server and Azure SQL Database. Check `sys.databases.is_read_committed_snapshot_on` on both sides before migrating.

```sql
ALTER DATABASE Shop SET READ_COMMITTED_SNAPSHOT ON;   -- requires no other active connections briefly
```

```recall
Q: What's the difference between blocking and a deadlock?
A: Blocking is one transaction waiting for a lock another holds, which resolves once the holder finishes; a deadlock is a cycle of transactions each waiting on the other, which can't resolve itself and SQL Server must kill one (the deadlock victim).

Q: What does lock escalation do, and what can it cause?
A: Converts many fine-grained row/page locks into one table-level lock to save memory (around a 5,000-lock threshold by default); it can suddenly block other sessions that weren't blocked a moment before.

Q: What should application code do when it receives SQL error 1205?
A: Treat it as an expected outcome and retry the transaction (often with a short backoff), rather than treating it purely as a bug to eliminate.

Q: Does Azure SQL Database default to READ_COMMITTED_SNAPSHOT ON or OFF, and how does that differ from on-premises SQL Server?
A: Azure SQL Database defaults to RCSI ON; on-premises SQL Server and SQL Server on an Azure VM default to OFF — a frequent source of subtly different behaviour when migrating between them.
```
