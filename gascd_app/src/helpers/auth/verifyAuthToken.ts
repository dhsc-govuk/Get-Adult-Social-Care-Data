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
  jwksUri: `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${userFlow}/discovery/v2.0/keys`,
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
): Promise<{ verifiedToken: VerifiedToken }> {
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
        resolve(decoded as VerifiedToken);
      }
    );
  });

  // TODO add GraphAPI

  return { verifiedToken };
}
