---
title: Reading SQL Server Execution Plans
summary: Estimated vs actual plans in SSMS, the operators that reveal a slow query, SET STATISTICS, and why missing-index suggestions need a second opinion.
difficulty: intermediate
tags: [sql, mssql, tsql, databases, performance]
order: 5
related: [databases/indexes, databases/tsql-essentials, databases/sql-server-performance-tuning]
status: needs-review
reviewNotes: New entry for the SQL Server batch — the SQL Server/SSMS-specific counterpart to the generic EXPLAIN guidance in databases/indexes.md.
---

[Database Indexes](indexes.md) covers *why* indexes speed up queries. This entry covers *how to see what SQL Server actually did*, specifically in SSMS or Azure Data Studio.

## Estimated vs actual plans

- **Estimated plan** (`Ctrl+L` in SSMS) — compiles the plan without running the query. Fast, but based on statistics, which can be wrong.
- **Actual plan** (`Ctrl+M`, then run the query) — runs the query and shows what really happened, including **actual row counts**, which is what you compare against the estimates to spot a bad plan.

> [!TIP]
> A large gap between **estimated** and **actual** row counts on an operator is the single most useful signal in a plan — it usually means stale statistics or a non-sargable predicate, and it's often the root cause of a plan that looks fine on paper but runs slowly.

## Reading the graphical plan

Plans read **right to left, bottom to top**: data flows from the rightmost leaf operators up and left to the final `SELECT`. Thicker arrows mean more rows flowing through.

| Operator | What it means |
| --- | --- |
| **Clustered Index Scan** | Reading the whole table in clustered-key order — fine for small tables, a red flag on large ones |
| **Clustered/Nonclustered Index Seek** | Jumping straight to matching rows — what you want to see |
| **Key Lookup** | A nonclustered index found the row, but needed more columns, so it goes back to the clustered index *per row* — expensive at volume; fix with a covering index (`INCLUDE`) |
| **Nested Loops** | For each outer row, probe the inner input — efficient when the outer side is small |
| **Hash Match** | Builds a hash table from one input, probes with the other — good for large, unsorted inputs with no useful index |
| **Merge Join** | Both inputs already sorted on the join key — very efficient, but needs that sort order to exist |
| **Sort** | An explicit sort step — expensive; often avoidable with an index in the right order |

Hover any operator in SSMS for its tooltip: estimated/actual rows, estimated I/O and CPU cost, and the exact predicate used.

## SET STATISTICS: numbers instead of a picture

```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
SELECT * FROM Orders WHERE CustomerId = 7;
```

```text
Table 'Orders'. Scan count 1, logical reads 842, physical reads 0...
SQL Server Execution Times: CPU time = 15 ms, elapsed time = 18 ms.
```

**Logical reads** (pages read from the buffer cache) is the most stable, comparable metric for "how expensive was this query" — unlike wall-clock time, it isn't affected by what else the server was doing at the time.

## Missing index suggestions: useful, not gospel

SSMS and `sys.dm_db_missing_index_details` will suggest indexes based on queries the optimiser has seen. They're a helpful starting point, but:

- They don't account for the **write cost** of adding the index, or indexes that already almost cover the need.
- They never suggest merging with an existing similar index — you'll often get several overlapping suggestions you should consolidate yourself.
- They're based only on what's been **run and still cached** — a quiet reporting query you ran once won't show up.

Treat them as a lead to investigate with `EXPLAIN`-style reasoning (see [Database Indexes](indexes.md)), not an instruction to apply verbatim.

## Parameter sniffing

SQL Server builds and caches **one plan per stored procedure/parameterised query**, based on the parameter values used the *first time* it compiled. If that first call was unusually small or large, every later call reuses that same plan — sometimes badly suited to typical values. Symptoms: a procedure is fast for some callers and slow for others with no code change.

Common fixes: `OPTION (RECOMPILE)` on the specific statement (always recompiles — costly if run often), `OPTIMIZE FOR` a representative value, or enabling the Query Store's automatic plan regression detection (see [Performance Tuning](sql-server-performance-tuning.md)).

```recall
Q: What's the difference between an estimated and an actual execution plan in SSMS?
A: The estimated plan is compiled without running the query (based on statistics only); the actual plan runs it and includes real row counts, letting you compare estimated vs actual to spot bad assumptions.

Q: What does a Key Lookup operator indicate, and how do you usually fix it?
A: A nonclustered index found matching rows but lacked a needed column, so SQL Server goes back to the clustered index per row; fix with a covering index using INCLUDE.

Q: Why is "logical reads" often a better metric than elapsed time when comparing query performance?
A: It measures pages read from the buffer cache, which is stable and comparable regardless of what else the server was doing, unlike wall-clock time.

Q: What is parameter sniffing, and what's one way to work around it?
A: SQL Server caches one plan per query based on the first parameter values it compiled with, which can be a poor fit for other values; fixes include OPTION (RECOMPILE), OPTIMIZE FOR, or Query Store plan forcing.
```
