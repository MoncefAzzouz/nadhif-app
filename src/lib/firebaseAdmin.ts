import { initializeApp, cert, getApps, ServiceAccount } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import fs from 'fs';
import dotenv from 'dotenv';
import prisma from './prisma';

dotenv.config();

/**
 * Resolves a Firebase service-account credential from (in order):
 *   1. FIREBASE_SERVICE_ACCOUNT      – the raw service-account JSON string
 *   2. FIREBASE_SERVICE_ACCOUNT_PATH – a path to the service-account JSON file
 *   3. GOOGLE_APPLICATION_CREDENTIALS – standard Google credentials file path
 *
 * If none are present the SDK is left uninitialized and push sending becomes a
 * no-op (so the API keeps working in environments without the key).
 */
function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw && raw.trim().startsWith('{')) {
    try {
      return JSON.parse(raw) as ServiceAccount;
    } catch (e) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }
  const path =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (path && fs.existsSync(path)) {
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8')) as ServiceAccount;
    } catch (e) {
      console.error('Failed to read Firebase service account file:', e);
    }
  }
  return null;
}

let initialized = false;

function ensureInitialized(): boolean {
  if (initialized) return true;
  if (getApps().length > 0) {
    initialized = true;
    return true;
  }
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.warn(
      'Firebase Admin not configured (no service account). Push notifications are disabled.'
    );
    return false;
  }
  initializeApp({ credential: cert(serviceAccount) });
  initialized = true;
  console.log('Firebase Admin initialized — push notifications enabled.');
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushResult {
  success: number;
  failure: number;
}

// FCM allows at most 500 tokens per multicast request.
const FCM_MULTICAST_LIMIT = 500;

/**
 * Sends a push notification to the given device tokens, chunked to respect the
 * FCM multicast limit. Invalid/expired tokens are pruned from the database.
 */
export async function sendPushToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<PushResult> {
  const result: PushResult = { success: 0, failure: 0 };
  if (!ensureInitialized() || tokens.length === 0) return result;

  const staleTokens: string[] = [];

  for (let i = 0; i < tokens.length; i += FCM_MULTICAST_LIMIT) {
    const chunk = tokens.slice(i, i + FCM_MULTICAST_LIMIT);
    const message: MulticastMessage = {
      tokens: chunk,
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);
      result.success += response.successCount;
      result.failure += response.failureCount;
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const code = res.error?.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/invalid-argument'
          ) {
            staleTokens.push(chunk[idx]);
          }
        }
      });
    } catch (e) {
      console.error('sendPushToTokens chunk failed:', e);
      result.failure += chunk.length;
    }
  }

  if (staleTokens.length > 0) {
    await prisma.deviceToken.deleteMany({
      where: { token: { in: staleTokens } },
    });
  }

  return result;
}

/**
 * Sends a push notification to every device registered for `userId`.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  try {
    const tokens = await prisma.deviceToken.findMany({ where: { userId } });
    await sendPushToTokens(tokens.map((t) => t.token), payload);
  } catch (e) {
    console.error('sendPushToUser failed:', e);
  }
}
