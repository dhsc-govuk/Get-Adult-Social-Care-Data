import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';

const tenant = process.env.AZURE_AD_TENANT_NAME;
const userFlow = process.env.AZURE_AD_B2C_USER_SIGN_IN;

export interface VerifiedToken extends JwtPayload {
  oid?: string;
  sub?: string;
}

export interface B2CGraphUser {
  id: string;
  displayName?: string;
  mail?: string;
  location_type?: string;
}

const azureB2cClient = jwksClient({
  //jwksUri: 'https://<your-tenant-name>.b2clogin.com/<your-tenant-name>.onmicrosoft.com/<your-policy>/discovery/v2.0/keys'
  jwksUri:
    //TODO change this to use Env Variables
    'https://DHSCGASCAuthDev.b2clogin.com/DHSCGASCAuthDev.onmicrosoft.com/B2C_1_GASCD_User_Sign_In/discovery/v2.0/keys',
});

function getAzureKey(header: JwtHeader, callback: SigningKeyCallback): void {
  if (!header.kid) {
    return callback(new Error('Missing kid in token header'));
  }
  azureB2cClient.getSigningKey(
    header.kid,
    (err: Error | null, key?: SigningKey) => {
      if (err) {
        return callback(err);
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    }
  );
}

export async function verifyAuthToken(
  idToken: string
): Promise<{ verifiedToken: VerifiedToken; b2cGraphUser: B2CGraphUser }> {
  // Check that the Token Is valid
  const verifiedToken = await new Promise<VerifiedToken>((resolve, reject) => {
    jwt.verify(
      idToken,
      getAzureKey,
      { algorithms: ['RS256'] },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        if (typeof decoded !== 'object' || decoded === null) {
          return reject(new Error('Invalid token payload'));
        }
        console.log('Decoded JWT:', decoded); //TODO Remove 

        resolve(decoded as VerifiedToken);
      }
    );
  });

  // Check that the user is the right User
  // const response = await fetch('https://graph.microsoft.com/v1.0/me', {
  //   headers: {
  //     Authorization: `Bearer ${idToken}`,
  //   },
  // });

  // if (!response.ok) {
  //   throw new Error('Error calling Graph API');
  // }

  // const b2cGraphUser = (await response.json()) as B2CGraphUser;

  // if (
  //   b2cGraphUser.id !== verifiedToken.oid &&
  //   b2cGraphUser.id !== verifiedToken.sub
  // ) {
  //   throw new Error('User identity does not match');
  // }

  // Crack on and load the page
  return { verifiedToken };
}
