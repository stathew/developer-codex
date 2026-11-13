---
title: Webhooks
summary: Event-driven HTTP callbacks between applications — how they compare to polling, and how to send and receive them reliably and securely.
difficulty: intermediate
tags: [webhooks, http, integration, events, backend]
order: 6
related: [backend/rest-api-design, backend/json-web-tokens]
status: needs-review
reviewNotes: Imported from the 2023 Web Hooks note. Kept the polling comparison; added signature verification, retries, idempotency and receiver best practices.
---

A **webhook** is an HTTP request one application sends to another **when something happens** — a payment succeeds, a pull request opens, an order ships. The receiver registers a URL; the sender `POST`s an event to it.

## Webhooks vs polling

- **Polling** — you repeatedly ask "anything new?" Simple, but wasteful and always somewhat stale.
- **Webhooks** — the source tells you as soon as something happens. Near real-time and efficient, but now *you* must run a reliable, secure endpoint.

```http
POST /webhooks/payments HTTP/1.1
Content-Type: application/json
Webhook-Id: evt_01JD3K2Q8Z
Webhook-Timestamp: 1794563100
Webhook-Signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=

{ "type": "payment.succeeded", "data": { "paymentId": "pay_123", "amount": 4200 } }
```

## Receiving webhooks safely

1. **Verify the signature.** Senders sign the payload with a shared secret (usually HMAC-SHA256). Recompute it over the **raw body** and compare in constant time. Anyone can `POST` to a public URL.
2. **Reject stale timestamps** (e.g. older than five minutes) to block replay attacks.
3. **Respond fast.** Return `2xx` quickly and do the real work in a background queue — senders time out and retry.
4. **Be idempotent.** Retries mean you *will* get duplicates. Store processed event IDs and skip repeats.
5. **Don't trust the order.** Events can arrive out of sequence; re-fetch the current state from the API if order matters.

## Sending webhooks well

- Retry with exponential backoff, and disable endpoints that fail persistently.
- Include an event ID, type and timestamp; version your payloads.
- Offer a way to replay missed events and a test-send button.
- Consider the open [Standard Webhooks](https://www.standardwebhooks.com/) conventions for headers and signatures.

```recall
Q: How do webhooks differ from polling?
A: With polling the consumer repeatedly asks for changes; with webhooks the producer pushes an HTTP request to the consumer when an event happens.

Q: Why must webhook handlers be idempotent?
A: Senders retry on timeouts and failures, so the same event can be delivered more than once.

Q: How do you verify a webhook really came from the sender?
A: Recompute the HMAC signature over the raw request body with the shared secret, compare it in constant time, and check the timestamp to prevent replays.
```
