---
title: T-SQL Essentials
summary: The T-SQL you reach for constantly beyond basic SELECT — CTEs, window functions, MERGE, APPLY, and structuring procedures safely.
difficulty: intermediate
tags: [sql, mssql, tsql, databases]
order: 4
related: [databases/relational-databases, databases/sql-server-execution-plans, databases/entity-framework-core]
status: needs-review
reviewNotes: New entry for the SQL Server batch. Syntax checked against current T-SQL reference docs on 2026-11-21.
---

**T-SQL** (Transact-SQL) is Microsoft's SQL dialect for SQL Server and Azure SQL. Beyond standard `SELECT`/`INSERT`/`UPDATE`/`DELETE`, a handful of constructs do most of the heavy lifting in real applications.

## Common Table Expressions (CTEs)

A CTE names a temporary result set for the duration of one statement — mainly for readability, and essential for recursion.

```sql
WITH RecentOrders AS (
    SELECT CustomerId, OrderId, Total
    FROM Orders
    WHERE CreatedAt >= DATEADD(day, -30, SYSUTCDATETIME())
)
SELECT c.Name, COUNT(*) AS OrderCount, SUM(r.Total) AS Spent
FROM RecentOrders r
JOIN Customers c ON c.Id = r.CustomerId
GROUP BY c.Name;
```

**Recursive CTEs** walk hierarchies (org charts, category trees, bill-of-materials):

```sql
WITH OrgChart AS (
    SELECT Id, Name, ManagerId, 0 AS Depth
    FROM Employees WHERE ManagerId IS NULL           -- anchor: the top
    UNION ALL
    SELECT e.Id, e.Name, e.ManagerId, o.Depth + 1     -- recursive: one level down
    FROM Employees e
    JOIN OrgChart o ON e.ManagerId = o.Id
)
SELECT * FROM OrgChart ORDER BY Depth;
```

> [!WARNING]
> An unbounded recursive CTE on bad data (a cycle) runs forever. SQL Server defaults `MAXRECURSION` to 100 — raise it deliberately (`OPTION (MAXRECURSION 1000)`), never to `0` (unlimited) without being certain the data can't cycle.

## Window functions

Compute a value across a set of rows *related to the current row*, without collapsing them into groups the way `GROUP BY` does.

```sql
SELECT
    OrderId, CustomerId, CreatedAt, Total,
    ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY CreatedAt DESC) AS RowNum,   -- 1, 2, 3… per customer
    RANK()       OVER (ORDER BY Total DESC) AS RankByValue,                          -- ties share a rank, gaps follow
    SUM(Total)   OVER (PARTITION BY CustomerId ORDER BY CreatedAt
                        ROWS UNBOUNDED PRECEDING) AS RunningTotal,
    LAG(Total)   OVER (PARTITION BY CustomerId ORDER BY CreatedAt) AS PreviousOrderTotal
FROM Orders;
```

`ROW_NUMBER` is the classic tool for "the latest N rows per group" — filter with a CTE, since window functions can't go in `WHERE` directly:

```sql
WITH Ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY CreatedAt DESC) AS RowNum
    FROM Orders
)
SELECT * FROM Ranked WHERE RowNum = 1;   -- each customer's most recent order
```

## MERGE: upsert in one statement

```sql
MERGE INTO Inventory AS target
USING (VALUES (@ProductId, @Delta)) AS source (ProductId, Delta)
    ON target.ProductId = source.ProductId
WHEN MATCHED THEN
    UPDATE SET Quantity = target.Quantity + source.Delta
WHEN NOT MATCHED THEN
    INSERT (ProductId, Quantity) VALUES (source.ProductId, source.Delta);
```

> [!WARNING]
> `MERGE` has had well-documented concurrency edge cases under high contention. For a simple upsert, many teams prefer the plainer and equally safe pattern: `UPDATE … WHERE`, then `IF @@ROWCOUNT = 0 INSERT …` inside a transaction with an appropriate isolation level, or an `INSERT … ON CONFLICT`-style pattern isn't native to T-SQL, so the `UPDATE`-then-`INSERT` idiom is the common alternative.

## APPLY: a join that can reference the outer row

`CROSS APPLY` runs a table-valued expression **per row** of the outer query, letting that expression reference the outer row's columns — something a plain `JOIN` can't do.

```sql
-- Each customer's 3 most recent orders, without a window function
SELECT c.Name, recent.OrderId, recent.CreatedAt
FROM Customers c
CROSS APPLY (
    SELECT TOP 3 OrderId, CreatedAt
    FROM Orders o
    WHERE o.CustomerId = c.Id
    ORDER BY CreatedAt DESC
) AS recent;
```

`OUTER APPLY` is the `LEFT JOIN` equivalent — keeps the outer row even when the apply produces nothing.

## Stored procedures and error handling

```sql
CREATE OR ALTER PROCEDURE dbo.PlaceOrder
    @CustomerId INT, @ProductId INT, @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        UPDATE Inventory SET Quantity -= @Quantity WHERE ProductId = @ProductId AND Quantity >= @Quantity;
        IF @@ROWCOUNT = 0 THROW 50001, 'Insufficient stock', 1;
        INSERT INTO Orders (CustomerId, ProductId, Quantity) VALUES (@CustomerId, @ProductId, @Quantity);
        COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK;
        THROW;   -- re-raise with the original error number, message and line
    END CATCH
END;
```

`THROW` (no arguments) inside a `CATCH` re-raises the original error faithfully; the older `RAISERROR` doesn't preserve the original error number the same way.

```recall
Q: Why can't you filter on a window function result directly in a WHERE clause?
A: Window functions are evaluated after WHERE/GROUP BY in logical query processing order; wrap the query in a CTE or subquery and filter on the computed column there.

Q: What does CROSS APPLY let you do that a plain JOIN can't?
A: Run a table-valued expression per outer row that can reference that outer row's columns — useful for "top N per group" and calling table-valued functions per row.

Q: What's the risk of recursive CTEs on cyclic data?
A: They can run indefinitely; SQL Server's default MAXRECURSION of 100 limits this, and it should be raised deliberately, never disabled, without being sure the data can't cycle.

Q: Why use THROW instead of RAISERROR to re-raise an error in a CATCH block?
A: THROW with no arguments preserves the original error number, message and severity; RAISERROR doesn't reproduce the original error the same way.
```
