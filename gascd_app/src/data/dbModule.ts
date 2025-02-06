import { AzureCliCredential } from '@azure/identity';
import sql, { config as SQLConfig, ConnectionPool } from 'mssql';

export async function getAccessToken(): Promise<string> {
    const credential = new AzureCliCredential();
    try {
        const tokenResponse = await credential.getToken("https://database.windows.net/.default");
        if (tokenResponse) {
            return tokenResponse.token;
        } else {
            throw new Error("Failed to receive token.");
        }
    } catch (err) {
        console.error("Failed to get access token:", err);
        throw err;
    }
}

export async function connectToDB(): Promise<ConnectionPool> {
    const dbServer = process.env.DB_SERVER;
    const dbPort = Number(process.env.DB_PORT);
    const dbName = process.env.DB_DATABASE;

    if (!dbServer || !dbPort || !dbName) {
        throw new Error("Missing database configuration environment variables.");
    }

    const token = await getAccessToken();

    const config: SQLConfig = {
        server: dbServer,
        port: dbPort,
        database: dbName,
        authentication: {
            type: 'azure-active-directory-access-token',
            options: {
                token: token
            }
        },
        options: {
            encrypt: true,
            trustServerCertificate: false,
            enableArithAbort: true,
        }
    };

    return sql.connect(config);
}