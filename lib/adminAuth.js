import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "./auth";
import connectDB from "./mongodb";
import Admin from "./models/Admin";

/**
 * Extract and verify the authenticated admin from a request.
 * Checks HttpOnly cookie first, then Authorization header.
 * Returns the admin document or null if unauthenticated.
 */
export async function getAuthenticatedAdmin(request) {
  let token = null;

  // 1. Try HttpOnly cookie
  try {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  } catch {
    // cookies() may throw outside request context
  }

  // 2. Fall back to Authorization header (for API clients)
  if (!token && request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.adminId) return null;

  try {
    await connectDB();
    const admin = await Admin.findById(payload.adminId).select("-password");
    return admin || null;
  } catch (err) {
    console.warn("Admin lookup failed in getAuthenticatedAdmin:", err.message);
    return null;
  }
}

/**
 * Higher-order handler that wraps a route handler with admin authentication.
 * Injects verified admin as 3rd argument.
 *
 * Usage:
 *   export const POST = requireAuth(async (req, ctx, admin) => { ... });
 */
export function requireAuth(handler) {
  return async (request, context) => {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      return Response.json(
        { success: false, error: "Unauthorized — please log in" },
        { status: 401 }
      );
    }

    return handler(request, context, admin);
  };
}
