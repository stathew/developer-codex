---
title: Retrieval-Augmented Generation (RAG)
summary: Grounding LLM answers in your own data — embeddings, chunking, vector search, prompt assembly, citations, and the ways RAG systems fail.
difficulty: intermediate
tags: [ai, rag, llm, embeddings, vector-search]
order: 4
related: [databases/choosing-a-database, ai-era/evaluating-ai-features, ai-era/prompting-for-code]
status: needs-review
reviewNotes: New entry from the topic-gaps batch.
---

A large language model only knows what was in its training data, which is general, frozen at a cutoff date, and doesn't include your private documents. **Retrieval-Augmented Generation (RAG)** fixes this by **retrieving relevant content at question time and putting it in the prompt**, so the model answers from your data and can cite its sources.

## The pipeline

```text
Indexing (offline):   documents → split into chunks → embed each chunk → store vectors + text
Answering (online):   question → embed → find similar chunks → build prompt with them → LLM → answer + citations
```

### 1. Chunking

Split documents into passages small enough to be specific but large enough to make sense: often a few hundred tokens, split on headings or paragraphs, with a little overlap. Keep metadata (source, title, section, date, permissions) with every chunk.

> [!TIP]
> This codex already does a simple version of this: its search index splits every entry into heading-level sections, which would make natural RAG chunks.

### 2. Embeddings

An **embedding model** turns text into a vector (a list of numbers) such that texts with similar *meaning* end up close together. "How do I reset my password?" lands near "Changing your login credentials" even with no shared words.

### 3. Retrieval

Store the vectors in a **vector index** (pgvector, Azure AI Search, Qdrant…) and find the nearest neighbours to the question's vector. In practice the best results come from:

- **Hybrid search:** combine vector similarity with keyword search (BM25), which catches exact terms such as error codes and product names.
- **Re-ranking:** a second model re-scores the top results for relevance.
- **Filters:** by permissions, product or date, using chunk metadata.

### 4. Generation

Assemble a prompt with instructions, the retrieved chunks and the question:

```text
Answer using ONLY the sources below. If they don't contain the answer, say you don't know.
Cite sources as [n].

[1] (rest-api-design § Idempotency keys) To make POST safe to retry, accept a client-generated key…
[2] (webhooks § Receiving webhooks safely) Retries mean you will get duplicates…

Question: How do I make payment requests safe to retry?
```

## Why RAG rather than fine-tuning?

| | RAG | Fine-tuning |
| --- | --- | --- |
| Adds knowledge | Yes, and updates instantly when documents change | Poorly; better for style and format |
| Citations | Natural | No |
| Permissions | Filter per user at retrieval time | Baked into weights; hard to control |
| Cost to update | Re-index documents | Retrain |

Most "chat with our docs" products use RAG. Fine-tuning is for changing behaviour, not adding facts.

## How RAG fails

- **Retrieval misses:** the right chunk exists but isn't found (bad chunking, vocabulary mismatch, no hybrid search). **Most RAG quality problems are retrieval problems.**
- **Hallucination despite context:** the model ignores or embellishes the sources. Instruct it to say "I don't know", and require citations.
- **Stale or conflicting sources:** keep the index in sync and prefer recent or authoritative documents.
- **Leaking data:** retrieval must respect the user's permissions, or the model will happily summarise documents the user shouldn't see.
- **Prompt injection via documents:** retrieved text can contain instructions ("ignore previous instructions…"). Treat retrieved content as untrusted data, never as instructions.

Measure all of these with evals. See [Evaluating AI Features](evaluating-ai-features.md).

```recall
Q: What problem does RAG solve?
A: LLMs lack your private and recent data; RAG retrieves relevant content at query time and includes it in the prompt so answers are grounded and citable.

Q: What is an embedding?
A: A vector representation of text where semantically similar texts are close together, enabling similarity search.

Q: Why use hybrid (vector + keyword) search in RAG?
A: Vector search captures meaning; keyword search catches exact terms like error codes and names. Together they retrieve better.

Q: Where do most RAG quality problems come from?
A: Retrieval — the right content isn't found or isn't ranked highly enough.

Q: When should you fine-tune instead of using RAG?
A: To change a model's behaviour, style or output format; RAG is better for adding or updating knowledge.

Q: Why is prompt injection a risk in RAG?
A: Retrieved documents may contain instructions; the system must treat retrieved text as data, not commands.
```
