---
title: SQL Server Backup, Recovery & High Availability
summary: Recovery models, backup types and point-in-time restore, Always On Availability Groups vs Failover Cluster Instances — and what Azure SQL Database does for you instead.
difficulty: advanced
tags: [sql, mssql, databases, azure]
order: 8
related: [databases/sql-server-locking-and-deadlocks, azure/azure-sql-database, design/system-design-fundamentals]
status: needs-review
reviewNotes: New entry for the SQL Server batch, written as the on-prem/VM counterpart to Azure SQL Database's built-in HA section.
---

If you're running SQL Server yourself — on-premises or on a VM — backup and high availability are **your** job. This entry covers what that job involves; [Azure SQL Database](../azure/azure-sql-database.md) covers what Microsoft takes off your plate when you move to that PaaS service instead.

## Recovery models

| Model | Transaction log behaviour | Point-in-time restore |
| --- | --- | --- |
| **Simple** | Log space is reused automatically; no log backups | No — only to the last full/differential backup |
| **Full** | Log grows until backed up; nothing is lost between log backups | Yes, to any point covered by log backups |
| **Bulk-logged** | Like Full, but minimally logs certain bulk operations for speed | Mostly, with caveats around the bulk-logged operations |

**Full** is the standard choice for production databases where losing recent transactions is unacceptable. **Simple** suits dev/test or databases that are rebuilt from another source of truth.

## Backup types

- **Full** — the whole database, a point to restore from.
- **Differential** — everything changed since the last full backup; faster to take and restore than another full.
- **Transaction log** — every transaction since the last log backup; required for point-in-time restore under the Full model, and must be taken regularly or the log file grows unbounded.

```sql
BACKUP DATABASE Shop TO DISK = 'Z:\Backups\Shop.bak' WITH COMPRESSION;
BACKUP LOG Shop TO DISK = 'Z:\Backups\Shop_log.trn';

-- Restore to a specific point in time (requires the log chain: full → diffs/logs in order)
RESTORE DATABASE Shop FROM DISK = 'Z:\Backups\Shop.bak' WITH NORECOVERY;
RESTORE LOG Shop FROM DISK = 'Z:\Backups\Shop_log.trn'
    WITH STOPAT = '2026-11-21T09:14:00', RECOVERY;
```

> [!WARNING]
> A backup you've never test-restored isn't a backup, it's a hope. The most common real-world data-loss incident isn't "no backups" — it's backups that turn out to be corrupted, incomplete, or missing a step in the restore chain, discovered only when they're needed.

## Always On Availability Groups vs Failover Cluster Instances

| | Availability Groups (AG) | Failover Cluster Instance (FCI) |
| --- | --- | --- |
| **Protects against** | Server, and database-level, failure | Server failure only (shared storage) |
| **Storage** | Each replica has its own copy of the data | Shared storage (SAN or Storage Spaces Direct) |
| **Readable secondaries** | Yes — offload reporting/read traffic | No — a passive standby only |
| **Granularity** | Per availability group of databases | The whole instance |

**AGs** are the more flexible, more commonly chosen option today: synchronous replicas for zero data loss on failover, asynchronous ones for disaster recovery in another region, and readable secondaries that take load off the primary. **FCIs** suit the simpler "protect this one instance" case, especially where shared storage already exists.

## What Azure SQL Database replaces

Moving to [Azure SQL Database](../azure/azure-sql-database.md) doesn't make backup and HA disappear — it makes them **Microsoft's problem instead of yours**:

| You'd manage on SQL Server | Azure SQL Database does automatically |
| --- | --- |
| Scheduling full/diff/log backups | Automated backups, retained per the service tier |
| Building and testing a restore procedure | Point-in-time restore via the portal/CLI |
| Setting up and monitoring an AG | Built-in HA within the region (zone-redundant configurations available) |
| Configuring geo-replication | Active geo-replication / auto-failover groups, a few clicks or an ARM/Bicep template |

This is the real argument for PaaS over IaaS for most new SQL workloads: not that the underlying engine is different (it mostly isn't), but that an entire category of operational work simply isn't yours to do anymore.

```recall
Q: Why does the Full recovery model allow point-in-time restore when Simple doesn't?
A: Full retains the transaction log until it's backed up, so log backups capture every transaction, which lets a restore roll forward to any covered point; Simple reuses log space automatically and keeps no such history.

Q: What's the key structural difference between an Always On Availability Group and a Failover Cluster Instance?
A: An AG replicates each replica's own copy of the data and allows readable secondaries; an FCI relies on shared storage and provides only a passive standby for the whole instance.

Q: What does moving to Azure SQL Database change about backup and HA responsibility, not about the underlying engine?
A: It moves the operational work (scheduling and testing backups, building HA/geo-replication) from you to Microsoft — the SQL Server engine underneath is largely the same.
```
