import PocketBase from 'pocketbase';

// PocketBase server URL - consider moving this to .env for flexibility
const PB_URL = process.env.NEXT_PUBLIC_BASE_URL + "/8090/";

// Create a singleton PocketBase instance
export const pb = new PocketBase(PB_URL);

// Optional: Add authentication method
export async function authenticatePocketBase() {
  try {
    // You can add your authentication logic here if needed
    // For example:
    // await pb.collection('users').authWithPassword('email', 'password');
  } catch (error) {
    console.error('PocketBase authentication failed:', error);
  }
}
