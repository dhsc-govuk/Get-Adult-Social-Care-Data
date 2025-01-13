"use client";

import { signIn } from "next-auth/react";

const SignInPage = () => {
  const handleSignUp = () => {
    signIn("azure-ad-b2c"); // Redirects to the B2C Sign-Up and Sign-In flow
  };

  return (
    <div style={{ textAlign: "center", margin: "auto", maxWidth: "400px" }}>
      <h1>Sign In or Register</h1>
      <button
        onClick={handleSignUp}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0078D4",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Register
      </button>
    </div>
  );
};

export default SignInPage;