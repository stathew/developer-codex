---
title: SQL Server Performance Tuning & Maintenance
summary: Keeping a SQL Server database healthy over time — statistics, index fragmentation, finding missing and unused indexes, and the Query Store.
difficulty: advanced
tags: [sql, mssql, databases, performance]
order: 7
related: [databases/indexes, databases/sql-server-execution-plans, databases/sql-server-locking-and-deadlocks]
status: needs-review
reviewNotes: New entry for the SQL Server batch. Fragmentation thresholds and Query Store defaults verified fresh against Microsoft Learn on 2026-11-21.
---

A database that was fast on day one degrades as data grows and changes, unless something keeps it maintained. Three things matter most: statistics, index health, and visibility into what's actually running.

## Statistics: why the optimiser needs them

SQL Server decides *how* to run a query (seek vs scan, which join type) based on **statistics** — a sampled summary of how values are distributed in a column. Stale statistics (after heavy inserts/updates/deletes) lead to bad row-count estimates, which lead to bad plans, even when the right indexes exist.

- **Auto-update statistics** is on by default, but only triggers after a meaningful fraction of rows change — on a large table, that can be a long time between updates.
- Update manually after bulk loads: `UPDATE STATISTICS Orders;` or `sp_updatestats` for a whole database.
- `WITH FULLSCAN` gives exact statistics instead of a sample — more accurate, more expensive to compute; reserve it for tables where sampled statistics keep causing bad plans.

## Index fragmentation

As rows are inserted, updated and deleted, index pages fragment — their logical order stops matching physical storage order, which hurts range scans and read-ahead.

```sql
SELECT OBJECT_NAME(ips.object_id) AS TableName, i.name AS IndexName, ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
JOIN sys.indexes i ON i.object_id = ips.object_id AND i.index_id = ips.index_id
WHERE ips.avg_fragmentation_in_percent > 5
ORDER BY ips.avg_fragmentation_in_percent DESC;
```

Microsoft's long-standing starting guidance:

| Fragmentation | Action |
| --- | --- |
| Under 5% | Leave it |
| 5–30% | `ALTER INDEX ... REORGANIZE` — online, lighter weight |
| Over 30% | `ALTER INDEX ... REBUILD` — fully rebuilds the index; can run `WITH (ONLINE = ON)` to avoid blocking |

These are a starting point to tune for your own workload, not a hard rule — a small, rarely-scanned table may never need attention regardless of its fragmentation percentage.

## Finding missing and unused indexes

```sql
-- Indexes the optimiser thinks would help, ranked by estimated impact
SELECT d.statement, gs.avg_user_impact, gs.user_seeks,
       'CREATE INDEX ix_' + REPLACE(REPLACE(d.equality_columns, ', ', '_'), '[', '') +
       ' ON ' + d.statement + ' (' + ISNULL(d.equality_columns, '') + ')' +
       CASE WHEN d.included_columns IS NOT NULL THEN ' INCLUDE (' + d.included_columns + ')' ELSE '' END AS SuggestedIndex
FROM sys.dm_db_missing_index_group_stats gs
JOIN sys.dm_db_missing_index_groups g ON g.index_group_handle = gs.group_handle
JOIN sys.dm_db_missing_index_details d ON d.index_handle = g.index_handle
ORDER BY gs.avg_user_impact * gs.user_seeks DESC;

-- Indexes that exist but are rarely or never used for reads — pure write overhead
SELECT OBJECT_NAME(s.object_id) AS TableName, i.name AS IndexName, s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM sys.dm_db_index_usage_stats s
JOIN sys.indexes i ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE s.database_id = DB_ID() AND (s.user_seeks + s.user_scans + s.user_lookups) = 0 AND s.user_updates > 0;
```

> [!WARNING]
> `sys.dm_db_index_usage_stats` resets when SQL Server restarts, so "zero reads" might just mean "hasn't restarted recently enough to see the quarterly report that uses this index." Check the uptime before dropping anything.

## Query Store: a flight recorder for query performance

The **Query Store** (on by default for new databases from SQL Server 2022 onward, and on by default in Azure SQL Database and Managed Instance since well before that) captures every query's plans and runtime stats over time — the single most useful feature for answering "this got slower; when, and why?"

```sql
ALTER DATABASE Shop SET QUERY_STORE = ON;
```

- See a query's plan **history** — spot exactly when a plan changed.
- **Force a specific plan** (`sp_query_store_force_plan`) when a known-good plan regressed, without touching application code.
- **Automatic plan regression detection** (SQL Server 2022+, and Azure SQL) can revert to a previous good plan on its own when it detects one has regressed.

```recall
Q: Why can stale statistics cause a bad execution plan even when the right indexes exist?
A: The optimiser chooses a plan based on estimated row counts from statistics; if those estimates are wrong, it may pick a scan, join type or memory grant that's badly suited to the real data volume.

Q: What are the standard fragmentation thresholds for choosing REORGANIZE vs REBUILD?
A: Under 5%, do nothing; 5–30%, REORGANIZE; over 30%, REBUILD — treated as a starting point to tune, not a hard rule.

Q: Why should you check server uptime before dropping an index that sys.dm_db_index_usage_stats shows as unused?
A: That DMV resets on restart, so "zero reads" might just mean the server hasn't been up long enough to see an infrequent (e.g. quarterly) query that relies on it.

Q: What does Query Store let you do that a one-off execution plan capture can't?
A: Shows a query's plan and performance history over time, lets you force a previously good plan without code changes, and (SQL Server 2022+/Azure SQL) can automatically revert a regressed plan.
```
