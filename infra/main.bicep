@description('Globally unique App Service name, 2-60 characters.')
@minLength(2)
@maxLength(60)
param appName string

param location string = resourceGroup().location

@description('F1 is free with shared compute and daily quotas. B1 and higher are paid plans.')
param skuName string = 'F1'

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: '${appName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: skuName
  }
  properties: {
    reserved: true
  }
}

resource app 'Microsoft.Web/sites@2024-04-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node server.js'
      alwaysOn: skuName != 'F1'
      healthCheckPath: skuName == 'F1' ? '' : '/api/health'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
    }
  }
}

resource settings 'Microsoft.Web/sites/config@2024-04-01' = {
  parent: app
  name: 'appsettings'
  properties: {
    NODE_ENV: 'production'
    HOSTNAME: '0.0.0.0'
    AUTH_URL: 'https://${app.properties.defaultHostName}'
    AUTH_TRUST_HOST: 'true'
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
  }
}

output websiteUrl string = 'https://${app.properties.defaultHostName}'
output appServiceName string = app.name
output appIdentityObjectId string = app.identity.principalId
