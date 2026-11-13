---
title: Spring & Spring Boot
summary: The dominant Java application framework — the IoC container, Spring Boot auto-configuration and starters, and the Spring MVC, Data and Security modules.
difficulty: intermediate
tags: [spring, java, backend, dependency-injection]
order: 13
related: [design/dependency-injection, backend/aspnet-core, design/repository-pattern, design/proxy-pattern]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Spring stub (no content). Version notes (Boot 3 needing Java 17+ and jakarta.* packages; Boot 4 on Spring Framework 7) should be checked against current Spring release notes.
---

**Spring** is the most widely used framework for building Java (and Kotlin) back ends. At its heart is an **inversion-of-control container** that creates and wires objects for you. Around that core sits a large family of projects for web, data, security, messaging and cloud.

**Spring Boot** sits on top of the Spring Framework and makes it quick to start. It provides sensible defaults, auto-configuration and an embedded web server, so `java -jar app.jar` runs a production-ready service.

## The IoC container and beans

Spring manages application objects, called **beans**, and injects their dependencies:

```java
@Service
public class OrderService {
    private final OrderRepository orders;

    public OrderService(OrderRepository orders) {   // constructor injection
        this.orders = orders;
    }

    public Order get(UUID id) {
        return orders.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }
}
```

`@Component` and its specialisations (`@Service`, `@Repository`, `@Controller`) mark classes for component scanning. `@Configuration` classes with `@Bean` methods define beans explicitly. This is the same [dependency injection](../design/dependency-injection.md) idea as ASP.NET Core's container.

Spring uses **proxies** heavily. `@Transactional`, `@Cacheable` and `@Async` work by wrapping your bean in a [proxy](../design/proxy-pattern.md).

> [!WARNING]
> Because of that proxy mechanism, calling a `@Transactional` method from **another method in the same class** bypasses the proxy, so no transaction is started. This "self-invocation" problem is one of the most common Spring bugs.

## Spring Boot

- **Starters:** curated dependency bundles. `spring-boot-starter-web` brings Spring MVC, JSON support and an embedded Tomcat.
- **Auto-configuration:** Boot configures beans based on what's on the classpath and in your properties. Add a database driver and you get a `DataSource`.
- **Externalised configuration:** `application.yml`, environment variables and profiles (`dev`, `prod`).
- **Actuator:** health checks, metrics and info endpoints for operations.

## A REST controller

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @GetMapping("/{id}")
    public Order get(@PathVariable UUID id) {
        return service.get(id);
    }
}
```

## Key modules

| Module | Purpose |
| --- | --- |
| **Spring MVC** | Servlet-based web and REST APIs |
| **Spring WebFlux** | Reactive, non-blocking web stack |
| **Spring Data JPA** | Repositories generated from interfaces (`findByCustomerId(...)`), on top of Hibernate |
| **Spring Security** | Authentication, authorisation, OAuth2 / OIDC |
| **Spring Cloud** | Configuration, service discovery and resilience for distributed systems |

## Versions worth knowing

- **Spring Boot 3** moved to a **Java 17** baseline and from `javax.*` to `jakarta.*` packages, which was a significant migration for older apps.
- **Spring Boot 4** (November 2025), built on Spring Framework 7, keeps the Java 17 baseline while adding first-class support for newer Java releases, and moves to newer Jakarta EE and Jackson versions.
- Virtual threads (Java 21+) are supported for scalable blocking I/O without going reactive.

## Spring compared with ASP.NET Core

The concepts map closely: IoC container ↔ DI container, `@RestController` ↔ controllers or minimal APIs, Spring Data JPA ↔ EF Core, Spring Security ↔ ASP.NET Core Identity and auth middleware, `application.yml` ↔ `appsettings.json`. If you know one, the other is mostly new syntax. See [ASP.NET Core](aspnet-core.md).

```recall
Q: What is the difference between Spring Framework and Spring Boot?
A: Spring Framework provides the IoC container and core modules; Spring Boot builds on it with auto-configuration, starters and an embedded server for quick, production-ready setup.

Q: What is a Spring bean?
A: An object whose creation, dependencies and lifecycle are managed by Spring's IoC container.

Q: Why does calling a @Transactional method from another method in the same class not start a transaction?
A: Spring implements @Transactional via a proxy around the bean; internal self-calls bypass the proxy.

Q: What did Spring Boot 3 change that complicated migrations?
A: A Java 17 baseline and the move from javax.* to jakarta.* package names.

Q: What does Spring Data JPA provide?
A: Repository interfaces whose query implementations Spring generates from method names (e.g. findByCustomerId), backed by JPA/Hibernate.
```
