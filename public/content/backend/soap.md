---
title: SOAP
summary: The XML messaging protocol behind enterprise web services — envelopes, WSDL contracts, WS-* standards, and how to integrate with SOAP services from modern .NET.
difficulty: intermediate
tags: [soap, xml, wsdl, api, integration, dotnet, legacy]
order: 12
related: [backend/api-styles-compared, backend/rest-api-design, design/adapter-pattern]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 SOAP stub (no content).
---

**SOAP** is an XML-based protocol for exchanging structured messages between systems. Its name originally stood for *Simple Object Access Protocol*; the acronym was dropped in version 1.2. It dominated enterprise web services in the 2000s and remains common in **banking, insurance, government, healthcare and ERP integrations**, so you'll likely meet it when integrating with established systems, even if you'd never choose it for a new API.

## The message: an envelope

Every SOAP message is an XML **envelope** with an optional **header** and a required **body**:

```xml
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:ord="http://example.com/orders">
  <soap:Header>
    <!-- metadata: security tokens, transaction IDs, routing -->
  </soap:Header>
  <soap:Body>
    <ord:GetOrder>
      <ord:OrderId>o_9</ord:OrderId>
    </ord:GetOrder>
  </soap:Body>
</soap:Envelope>
```

Errors come back as a **Fault** element in the body, with a code, a reason and optional detail.

SOAP is transport-independent but in practice almost always runs as **HTTP POST** to a single endpoint. The operation is named inside the body (and in a `SOAPAction` header in 1.1), not in the URL or HTTP method.

## WSDL: the contract

A **WSDL** (Web Services Description Language) document describes a service in XML: its operations, the message types (via XML Schema), the bindings and the endpoint address. Tools read the WSDL and **generate a typed client**, just as OpenAPI or `.proto` files do today. SOAP was contract-first long before it was fashionable.

## WS-* standards

SOAP's header model supports a family of extension specs, often called **WS-\***:

- **WS-Security:** message-level signing and encryption, independent of the transport.
- **WS-ReliableMessaging:** guaranteed, ordered delivery.
- **WS-AtomicTransaction:** distributed transactions across services.
- **WS-Addressing:** routing information inside the message.

This rich, standardised feature set is the main reason some regulated industries still require SOAP. It's also why SOAP gained its reputation for complexity.

## SOAP vs REST

| | SOAP | REST |
| --- | --- | --- |
| Nature | A protocol with a strict message format | An architectural style |
| Format | XML only | Any (usually JSON) |
| Contract | WSDL (required in practice) | Optional (OpenAPI) |
| HTTP usage | Mostly POST to one endpoint | Methods and URLs carry meaning |
| Caching | Effectively none at the HTTP level | Built on HTTP caching |
| Security | WS-Security (message-level), or TLS | TLS plus OAuth/JWT |
| Payload size | Verbose | Compact |

## Working with SOAP from modern .NET

- **Calling a SOAP service:** generate a client from the WSDL with `dotnet-svcutil` (or Visual Studio's *Connected Services*). The generated client uses the `System.ServiceModel` packages, which run on modern .NET.
- **Hosting SOAP services:** WCF server hosting isn't part of modern .NET. **CoreWCF**, a community-driven port supported by Microsoft, fills that gap for migrations.

> [!TIP]
> Wrap a generated SOAP client in an [adapter](../design/adapter-pattern.md) that implements your own interface. That keeps the XML-shaped generated types out of your domain, and makes the integration easy to fake in tests.

```recall
Q: What are the parts of a SOAP message?
A: An Envelope containing an optional Header (metadata such as security or transaction info) and a required Body (the payload, or a Fault on error).

Q: What is WSDL?
A: Web Services Description Language — an XML contract describing a SOAP service's operations, message types, bindings and endpoint, used to generate typed clients.

Q: Why do some industries still use SOAP?
A: Its WS-* standards provide message-level security, reliable messaging and distributed transactions, and many established enterprise systems already expose SOAP interfaces.

Q: How do you call a SOAP service from modern .NET?
A: Generate a client from the WSDL with dotnet-svcutil or Connected Services, which uses the System.ServiceModel client packages.

Q: How are SOAP errors returned?
A: As a Fault element inside the SOAP Body, with a code, a reason and optional detail.
```
