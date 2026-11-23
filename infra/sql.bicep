@description('Comma-separated possibleOutboundIpAddresses from the existing App Service.')
param appOutboundIps string = ''

@description('Globally unique Azure SQL server name.')
param sqlServerName string

param databaseName string = 'learning-portal'
param location string = resourceGroup().location

@description('Display name of the Microsoft Entra administrator group or user.')
param adminGroupName string

@description('Microsoft Entra object ID of the administrator group or user, not an application client ID.')
param adminGroupObjectId string

@description('Entra administrator principal type. User supports personal deployments without a group.')
@allowed([
  'Group'
  'User'
])
param adminPrincipalType string = 'Group'

@description('Optional developer public IPv4 address. Leave empty to block local access.')
param developerIp string = ''

resource server 'Microsoft.Sql/servers@2023-08-01' = {
  name: sqlServerName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    administrators: {
      administratorType: 'ActiveDirectory'
      principalType: adminPrincipalType
      login: adminGroupName
      sid: adminGroupObjectId
      tenantId: tenant().tenantId
      azureADOnlyAuthentication: true
    }
  }
}

resource database 'Microsoft.Sql/servers/databases@2023-08-01' = {
  parent: server
  name: databaseName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    maxSizeBytes: 2147483648
  }
}

var outboundIps = empty(appOutboundIps) ? [] : split(appOutboundIps, ',')

resource outboundRules 'Microsoft.Sql/servers/firewallRules@2023-08-01' = [for (ip, index) in outboundIps: {
  parent: server
  name: 'app-outbound-${index}'
  properties: {
    startIpAddress: ip
    endIpAddress: ip
  }
}]

resource developerRule 'Microsoft.Sql/servers/firewallRules@2023-08-01' = if (!empty(developerIp)) {
  parent: server
  name: 'developer'
  properties: {
    startIpAddress: developerIp
    endIpAddress: developerIp
  }
}

output sqlHostname string = server.properties.fullyQualifiedDomainName
output sqlDatabase string = database.name
output sqlIdentityObjectId string = server.identity.principalId
