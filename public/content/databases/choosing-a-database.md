---
title: Choosing a Database
summary: An overview of database types — relational, document, key-value, wide-column, graph, time-series, search and vector — and how to pick one.
difficulty: intermediate
tags: [databases, nosql, architecture, sql, vector]
order: 0
related: [databases/relational-databases, databases/indexes, backend/event-driven-architecture]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Databases Overview stub (no content).
---

There's no universally best database. Each type is optimised for particular **data shapes** and **access patterns**. The right question isn't "SQL or NoSQL?" but "how will this data be written, read and changed?"

## The main types

| Type | Data model | Strong at | Examples |
| --- | --- | --- | --- |
| **[Relational](relational-databases.md)** | Tables, rows, joins | Structured data, integrity, complex queries, transactions | PostgreSQL, SQL Server, MySQL, SQLite |
| **Document** | JSON-like documents | Flexible schemas, reading a whole object at once | MongoDB, Azure Cosmos DB, Firestore |
| **Key-value** | Key → value | Extremely fast lookups, caching, sessions | Redis/Valkey, DynamoDB, memcached |
| **Wide-column** | Rows with dynamic columns, partitioned | Massive write throughput at scale | Cassandra, ScyllaDB, Bigtable |
| **Graph** | Nodes and relationships | Highly connected data: social graphs, fraud detection, recommendations | Neo4j, Amazon Neptune |
| **Time-series** | Timestamped measurements | Metrics, IoT, monitoring | TimescaleDB, InfluxDB, Prometheus |
| **Search** | Inverted indexes | Full-text search, relevance ranking, faceting | Elasticsearch, OpenSearch, Azure AI Search |
| **Vector** | High-dimensional embeddings | Similarity search for AI features (semantic search, RAG) | pgvector, Pinecone, Qdrant, Weaviate |

## Key trade-offs

### Schema: on write vs on read

Relational databases enforce a schema **on write**, so bad data is rejected. Document stores let each document differ, which means the schema is effectively enforced **on read** by your application code. Flexibility up front can become inconsistency later.

### Consistency and the CAP theorem

In a distributed database, a network **partition** forces a choice between **consistency** (every read sees the latest write) and **availability** (every request gets a response). Many NoSQL systems choose availability with **eventual consistency**, and several let you tune it per query. Relational databases traditionally favour strong consistency.

### Scaling

Relational databases scale **vertically** very far, and horizontally with read replicas, partitioning, or distributed SQL (CockroachDB, YugabyteDB, Citus). Many NoSQL databases were designed to **scale out** across nodes from the start, at the cost of joins or cross-partition transactions.

### Query flexibility

SQL answers questions you didn't anticipate. Key-value and wide-column stores require you to **design around known access patterns** up front.

## How to choose

1. **Start relational** unless you have a specific reason not to. PostgreSQL in particular covers a huge range, including JSON columns, full-text search, and vectors via pgvector.
2. **Let access patterns decide.** Key lookups at huge scale suggest key-value; relationship traversal suggests graph; time-ordered metrics suggest time-series.
3. **Weigh operations, not just features.** Backups, monitoring, managed hosting and team familiarity matter more than benchmarks.
4. **Polyglot persistence is normal.** A typical system might use PostgreSQL as the source of truth, Redis for caching, a search index for product search, and a vector store for AI features. Each must be kept in sync, usually via events.

> [!AI]
> AI features have made **vector search** mainstream. Before adding a dedicated vector database, check whether your existing database supports vector indexes (PostgreSQL, SQL Server, MongoDB and Redis all have options). One fewer system to run is a real saving.

```recall
Q: Name five types of database and an example of each.
A: Relational (PostgreSQL), document (MongoDB), key-value (Redis), graph (Neo4j), time-series (TimescaleDB) — also wide-column (Cassandra), search (Elasticsearch) and vector (pgvector).

Q: What does the CAP theorem say?
A: During a network partition, a distributed system must choose between consistency (latest data everywhere) and availability (always respond).

Q: What does "schema on write" vs "schema on read" mean?
A: Schema on write: the database enforces structure when data is stored (relational). Schema on read: data is stored flexibly and the application interprets the structure when reading (document stores).

Q: What is polyglot persistence?
A: Using different database types within one system, each for the workload it suits best.

Q: What are vector databases used for?
A: Storing embeddings and running similarity search, e.g. semantic search and retrieval-augmented generation (RAG) for AI features.
```
