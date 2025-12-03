#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "argon2-cffi",
# ]
# ///

# Hashes a GOV.UK client secret, as per guidance:
# https://docs.sign-in.service.gov.uk/before-integrating/integrating-third-party-platform/#hash-your-client-secret

import argon2


def hash_client_secret(client_secret, salt):
    client_secret = client_secret.encode('ascii')
    salt = salt.encode('ascii')
    ph = argon2.PasswordHasher(
        time_cost=2, # aka iterations
        memory_cost=15360, 
        parallelism=1, 
        hash_len=16,
        type=argon2.low_level.Type.ID, # Argon2id
    )
    hashed_secret = ph.hash(client_secret, salt=salt)
    # sanity check
    ph.verify(hashed_secret, client_secret)
    return hashed_secret

if __name__ == "__main__":
    import sys
    # Define the input and output file names
    try:
        CLIENT_SECRET_FILENAME = sys.argv[1]
        SALT_FILENAME = sys.argv[2]
    except IndexError:
        print("Please provide paths to the client secret and salt files")
        sys.exit(1)

    with open(CLIENT_SECRET_FILENAME) as secretfile:
        client_secret = secretfile.read()

    with open(SALT_FILENAME) as saltfile:
        salt = saltfile.read()

    print(hash_client_secret(client_secret, salt))
