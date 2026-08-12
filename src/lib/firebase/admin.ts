import "server-only";

import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function adminApp() {
  if (getApps().length) return getApp();
  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Firebase project ID is not configured.");
  return initializeApp({ projectId });
}

export async function verifyFirebaseToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    return await getAuth(adminApp()).verifyIdToken(authorization.slice(7));
  } catch {
    return null;
  }
}
