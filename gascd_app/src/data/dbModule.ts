import {
  AzureCliCredential,
  ManagedIdentityCredential,
  TokenCredential,
} from '@azure/identity';
import sql, { config as SQLConfig, ConnectionPool } from 'mssql';
import tds from 'tedious';
import logger from '@/utils/logger';

export async function connectToDB(): Promise<ConnectionPool> {
  const dbServer = process.env.DB_SERVER;
  const dbPort = Number(process.env.DB_PORT);
  const dbName = process.env.DB_DATABASE;
  const authType: string = process.env.DB_AUTH_TYPE || 'azure-managed';

  if (!dbServer || !dbPort || !dbName) {
    throw new Error('Missing database configuration environment variables.');
  }

  let authOptions: tds.ConnectionAuthentication;
  let trustCert = false; // by default we don't trust self-signed certs
  if (authType === 'local') {
    authOptions = {
      type: 'default',
      options: {
        userName: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      },
    };
    trustCert = true;
  } else {
    authOptions = {
      // Uses the DefaultAzureCredential chain to try and find a relevant credential
      // (supports Azure CLI locally and Managed indentities in production)
      // https://learn.microsoft.com/en-gb/azure/developer/javascript/sdk/authentication/credential-chains#use-defaultazurecredential-for-flexibility
      type: 'azure-active-directory-default',
      options: {},
    };
  }

  const config: SQLConfig = {
    server: dbServer,
    port: dbPort,
    database: dbName,
    authentication: authOptions,
    options: {
      encrypt: true,
      trustServerCertificate: trustCert,
      enableArithAbort: true,
    },
  };

  return sql.connect(config);
}

// Set up a single connection pool to be re-used through application
export const dbPool = connectToDB();
