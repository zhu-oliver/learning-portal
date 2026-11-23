@description('Existing App Service to deploy; its runtime settings and identity are not changed.')
param appName string

param location string = resourceGroup().location

@description('Exact GitHub OIDC subject claim, including immutable owner/repository IDs.')
param githubSubject string = 'repo:zhu-oliver@44208600/learning-portal@1468309284:environment:production'

resource app 'Microsoft.Web/sites@2024-04-01' existing = {
  name: appName
}

resource deploymentIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${appName}-github-deploy'
  location: location
}

resource federation 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: deploymentIdentity
  name: 'github-production'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: githubSubject
    audiences: ['api://AzureADTokenExchange']
  }
}

var websiteContributor = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'de139f84-1756-47ae-9be6-808fbbe84772')

resource deploymentRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(app.id, deploymentIdentity.id, websiteContributor)
  scope: app
  properties: {
    principalId: deploymentIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: websiteContributor
  }
}

output clientId string = deploymentIdentity.properties.clientId
output tenantId string = deploymentIdentity.properties.tenantId
output subscriptionId string = subscription().subscriptionId
output resourceGroupName string = resourceGroup().name
output appServiceName string = app.name
