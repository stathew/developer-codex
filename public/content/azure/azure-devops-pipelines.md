---
title: Azure DevOps Pipelines
summary: YAML CI/CD pipelines on Azure DevOps — stages, jobs, templates, environments with approvals, and how they compare to GitHub Actions.
difficulty: intermediate
tags: [azure, cloud, ci-cd, devops]
order: 7
related: [devops/ci-cd, azure/azure-app-service, security/secrets-management]
status: needs-review
reviewNotes: New entry, the Azure DevOps counterpart to the general CI/CD Pipelines entry (which covers GitHub Actions). Syntax checked against current Microsoft Learn guidance on 2026-11-21.
---

**Azure Pipelines** (part of Azure DevOps, alongside Boards, Repos, Test Plans and Artifacts) is Microsoft's CI/CD service. If you've read [CI/CD Pipelines](../devops/ci-cd.md), the concepts transfer directly — this entry is the Azure DevOps-specific syntax and features.

## Pipeline structure

A YAML pipeline is built from **stages → jobs → steps**:

```yaml
trigger:
  branches: { include: [main] }

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        pool: { vmImage: 'ubuntu-latest' }
        steps:
          - task: UseDotNet@2
            inputs: { version: '10.x' }
          - script: dotnet restore
          - script: dotnet build --configuration Release
          - script: dotnet test --configuration Release
          - task: PublishBuildArtifacts@1
            inputs: { pathToPublish: '$(Build.ArtifactStagingDirectory)' }

  - stage: DeployStaging
    dependsOn: Build
    jobs:
      - deployment: DeployWebApp
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: 'my-service-connection'
                    appName: 'my-orders-api'
                    slotName: 'staging'
```

- **Stages** run in sequence by default (useful for build → deploy-staging → deploy-production) and can run in parallel with `dependsOn`.
- **Jobs** within a stage can run in parallel across agents.
- **Steps** are the individual tasks or scripts.

## Templates: shared pipeline logic

Extract repeated steps into a **template** so every service's pipeline stays consistent:

```yaml
# templates/build-dotnet.yml
parameters: [{ name: projectPath, type: string }]
steps:
  - script: dotnet build ${{ parameters.projectPath }} --configuration Release
  - script: dotnet test ${{ parameters.projectPath }} --configuration Release
```

```yaml
# azure-pipelines.yml
steps:
  - template: templates/build-dotnet.yml
    parameters: { projectPath: 'src/Orders.Api' }
```

## Environments and approvals

A pipeline **environment** (e.g. `production`) can require **manual approval** or **checks** (a business-hours gate, a linked work item, an automated health check) before a deployment proceeds — this is how you get continuous *delivery* (always releasable) without continuous *deployment* (always automatic) for the stages that need a human sign-off. See the delivery-vs-deployment distinction in [CI/CD Pipelines](../devops/ci-cd.md).

## Service connections and secrets

A **service connection** holds the credentials a pipeline uses to deploy to Azure, ideally backed by a **Workload Identity Federation** (OIDC-based, no stored secret) rather than a long-lived service principal secret — the same OIDC-over-secrets preference as GitHub Actions. Pipeline secrets live in **variable groups** or **Azure Key Vault-linked variable groups**, never in the YAML itself.

## Azure Pipelines vs GitHub Actions

| | Azure Pipelines | GitHub Actions |
| --- | --- | --- |
| Config | YAML, stages/jobs/steps | YAML, jobs/steps |
| Reuse | Templates | Reusable workflows, composite actions |
| Marketplace | Azure DevOps Marketplace tasks | GitHub Actions Marketplace |
| Tightest fit | Azure deployments, Azure Boards work-item linking | Repos already on GitHub, open-source ecosystem |

Both are capable, mature CI/CD systems; the natural choice usually follows where your code and work tracking already live.

```recall
Q: What are the three levels of structure in an Azure Pipelines YAML file?
A: Stages (run in sequence or parallel), jobs within a stage (can run in parallel), and steps within a job.

Q: What does a pipeline environment's approval/check give you that a plain deployment step doesn't?
A: A gate — manual approval or an automated check — before deployment proceeds, enabling continuous delivery without fully automatic deployment to that environment.

Q: What should hold the credentials a pipeline uses to deploy to Azure, and what's the more secure alternative to a stored secret?
A: A service connection; prefer Workload Identity Federation (OIDC) over a long-lived service principal secret.
```
