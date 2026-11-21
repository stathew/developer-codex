---
title: Microsoft Entra ID & App Identity
summary: Authenticating users and services on Azure — Entra ID (formerly Azure AD), App Registrations, MSAL, and Managed Identity for secret-free service-to-service auth.
difficulty: intermediate
tags: [azure, cloud, auth, security, oauth]
order: 5
related: [backend/oauth-and-openid-connect, security/secrets-management, azure/azure-app-service, azure/azure-sql-database]
status: needs-review
reviewNotes: New entry. Entra ID rename history and Managed Identity behaviour checked against current Microsoft Learn guidance on 2026-11-21.
---

**Microsoft Entra ID** is Microsoft's cloud identity platform — the service formerly called **Azure Active Directory (Azure AD)**, renamed in 2023. The rename was cosmetic for developers: the REST APIs, PowerShell module names and **MSAL** (Microsoft Authentication Library) weren't renamed, and on-premises Active Directory is a separate, unrelated product that also kept its name.

Entra ID is an implementation of [OAuth 2.0 and OpenID Connect](../backend/oauth-and-openid-connect.md) — the concepts there apply directly here.

## App Registrations

To let an application authenticate users or call an API, you register it in Entra ID. This gives it:

- An **Application (client) ID**.
- A **client secret** or **certificate** (for apps that can keep a secret, like a server-side API) — or neither, for public clients using PKCE.
- **API permissions** — scopes it can request (e.g. `User.Read` on Microsoft Graph, or a scope you define on your own API).
- A **redirect URI** for the OAuth flow to return to.

## Signing users in: MSAL

**MSAL** handles the OAuth/OIDC flows for you — token acquisition, caching, refresh — across platforms (.NET, JavaScript/Angular, Python, mobile).

```ts
// Angular, using @azure/msal-angular
export const msalConfig: Configuration = {
  auth: {
    clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: '/',
  },
};
```

```csharp
// ASP.NET Core API validating the incoming token
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
```

The API validates the incoming JWT's signature, issuer and audience exactly as described in [JSON Web Tokens](../backend/json-web-tokens.md) — Entra ID is just the issuer.

## Managed Identity: the no-secret option for services

For **service-to-service** calls between your own Azure resources, skip App Registrations and secrets entirely with a **Managed Identity**:

- **System-assigned** — tied to one resource's lifecycle (deleted when the resource is).
- **User-assigned** — a standalone identity you can attach to several resources.

```csharp
var credential = new DefaultAzureCredential();
var client = new SecretClient(new Uri("https://my-vault.vault.azure.net/"), credential);
```

`DefaultAzureCredential` tries several credential sources in order (environment variables, Managed Identity, Visual Studio/Azure CLI login) so the **same code works locally** (using your own signed-in identity) **and in Azure** (using the Managed Identity) with no code branching.

> [!WARNING]
> A client secret on an App Registration is a long-lived credential that must be rotated and can leak. Prefer Managed Identity for anything running on Azure, and certificates over secrets when an App Registration credential is unavoidable.

## Roles and permissions

- **Entra ID roles** govern access to Entra ID and Azure administration itself (who can create users, reset passwords).
- **Azure RBAC roles** govern access to Azure *resources* (who can read a Key Vault secret, restart a web app) — assigned to a user, group or Managed Identity, scoped to a subscription, resource group or single resource.
- **App roles / scopes** are what *your own application* defines and checks in its authorisation logic (`Policy.RequireRole("Admin")`), distinct from both of the above.

```recall
Q: Is Microsoft Entra ID a different product from Azure Active Directory?
A: No — it's a 2023 rename of the same service. APIs, PowerShell cmdlets and MSAL kept their old names.

Q: What does MSAL do?
A: Handles OAuth/OIDC token acquisition, caching and refresh for an application across platforms, so you don't implement the flows by hand.

Q: How does Managed Identity let the same code work both locally and on Azure?
A: DefaultAzureCredential tries several credential sources in order — a local sign-in (CLI/Visual Studio) during development, the Managed Identity when actually running on Azure — with no code change needed.

Q: What's the difference between Azure RBAC roles and app roles?
A: Azure RBAC controls access to Azure resources themselves (e.g. who can read a Key Vault secret); app roles are defined and enforced by your own application's authorisation logic.
```
