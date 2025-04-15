// import { defineConfig } from "convex/server";
// import { v } from "convex/values";
// import { Clerk } from "@clerk/clerk-sdk-node";

// // Initialize Clerk client
// const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// // This configures authentication for your Convex deployment
// export default defineConfig({
//   providers: [
//     {
//       name: "clerk",
//       type: "oidc",
      
//       // This function validates the identity token and returns the users' tokenIdentifier
//       validateToken: async (token) => {
//         try {
//           // Verify the token with Clerk
//           const res = await clerk.verifyToken(token);
          
//           // If verification succeeds, return the user ID as tokenIdentifier
//           if (res && res.sub) {
//             // The "clerk:" prefix helps identify the auth provider
//             return { tokenIdentifier: `clerk:${res.sub}` };
//           }
//           return { tokenIdentifier: undefined };
//         } catch (error) {
//           console.error("Error verifying token:", error);
//           return { tokenIdentifier: undefined };
//         }
//       },
//     }
//   ],
// });


// eslint-disable-next-line import/no-anonymous-default-export
export default {
    providers: [
      {
        domain: "https://star-elephant-79.clerk.accounts.dev",
        applicationID: "convex",
      },
    ],
  };
