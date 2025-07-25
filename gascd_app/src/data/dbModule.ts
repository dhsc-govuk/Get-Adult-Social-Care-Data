import {
  AzureCliCredential,
  ManagedIdentityCredential,
  TokenCredential,
} from '@azure/identity';
import sql, { config as SQLConfig, ConnectionPool } from 'mssql';
import tds from 'tedious';
import logger from '@/utils/logger';

export async function getAccessToken(useCLI = false): Promise<string> {
  let credential: TokenCredential;
  if (useCLI) {
    credential = new AzureCliCredential();
  } else {
    const clientId = process.env.SQL_MANAGED_IDENTITY_CLIENT_ID;
    if (clientId) {
      credential = new ManagedIdentityCredential(clientId);
    } else {
      logger.warn(
        'MANAGED_IDENTITY_CLIENT_ID environment variable is missing. Proceeding without client ID.'
      );
      credential = new ManagedIdentityCredential();
    }
  }

  try {
    const tokenResponse = await credential.getToken(
      'https://database.windows.net/.default'
    );
    if (tokenResponse) {
      return tokenResponse.token;
    } else {
      throw new Error('Failed to receive token.');
    }
  } catch (err) {
    logger.error('Failed to get access token:', err);
    throw err;
  }
}

export async function connectToDB(): Promise<ConnectionPool> {
  const dbServer = process.env.DB_SERVER;
  const dbPort = Number(process.env.DB_PORT);
  const dbName = process.env.DB_DATABASE;
  const authType: string = process.env.DB_AUTH_TYPE || 'azure-managed';

  if (!dbServer || !dbPort || !dbName) {
    throw new Error('Missing database configuration environment variables.');
  }

  let authOptions: tds.ConnectionAuthentication;
  let trustCert = false;
  if (authType === 'local') {
    authOptions = {
      type: 'default',
      options: {
        userName: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      },
    };
    trustCert = true;
  } else if (['azure-cli', 'azure-managed'].includes(authType)) {
    authOptions = {
      type: 'azure-active-directory-access-token',
      options: {
        token: await getAccessToken(authType === 'azure-cli'),
      },
    };
  } else {
    throw new Error(`Invalid DB_AUTH_TYPE: ${authType}`);
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
