import { MssqlDialect } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';

const getAuthOptions = () => {
  let authOptions: Tedious.ConnectionAuthentication;
  if (process.env.USER_DB_ACCESS_TOKEN) {
    // Used by deployment pipeline
    authOptions = {
      type: 'azure-active-directory-access-token',
      options: {
        token: process.env.USER_DB_ACCESS_TOKEN,
      },
    };
  } else if (process.env.USER_DB_USERNAME) {
    // Used in development
    authOptions = {
      options: {
        userName: process.env.USER_DB_USERNAME,
        password: process.env.USER_DB_PASSWORD,
      },
      type: 'default',
    };
  } else {
    authOptions = {
      // Uses the DefaultAzureCredential chain to try and find a relevant credential
      // (supports Azure CLI locally and Managed indentities in production)
      // https://learn.microsoft.com/en-gb/azure/developer/javascript/sdk/authentication/credential-chains#use-defaultazurecredential-for-flexibility
      type: 'azure-active-directory-default',
      options: {
        clientId: process.env.SQL_MANAGED_IDENTITY_CLIENT_ID,
      },
    };
  }
  return authOptions;
};

// https://www.better-auth.com/docs/adapters/mssql
export const msdialect = new MssqlDialect({
  tarn: {
    ...Tarn,
    options: {
      min: 0,
      max: 10,
    },
  },
  tedious: {
    ...Tedious,
    connectionFactory: () =>
      new Tedious.Connection({
        authentication: getAuthOptions(),
        options: {
          database: process.env.USER_DATABASE,
          port: Number(process.env.USER_DB_PORT),
          trustServerCertificate: false,
        },
        server: process.env.USER_DB_SERVER as string,
      }),
  },
  TYPES: {
    ...Tedious.TYPES,
    DateTime: Tedious.TYPES.DateTime2,
  },
});
