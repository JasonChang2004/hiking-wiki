import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { HttpsError, onCall, CallableRequest } from "firebase-functions/v2/https";

// 初始化 Firebase Admin SDK
admin.initializeApp();
const db = getFirestore();
const adminAuth = getAdminAuth();

/**
 * 驗證呼叫者是否為 admin，否則丟出錯誤
 */
function assertAdmin(request: CallableRequest<any>) {
  if (!request.auth?.token?.admin) {
    console.log("[AUTH] 權限不足：非 admin 或未登入");
    throw new HttpsError("permission-denied", "你必須是管理員才可執行此操作");
  }
}

/**
 * 將指定用戶設為管理員
 */
export const grantAdminRole = onCall(async (request: CallableRequest<{ uid: string }>) => {
  assertAdmin(request);

  const targetUid = request.data.uid;
  if (!targetUid) {
    throw new HttpsError("invalid-argument", "請指定要升級的用戶 UID");
  }

  try {
    await adminAuth.setCustomUserClaims(targetUid, { admin: true });
    await db.collection("users").doc(targetUid).set({ isAdmin: true }, { merge: true });

    console.log(`[ADMIN_GRANT] 成功授予管理員權限給 UID=${targetUid}`);
    return { message: `已成功授予管理員：${targetUid}` };
  } catch (error: any) {
    console.error(`[ADMIN_GRANT_ERROR] UID=${targetUid} - ${error.message}`);
    throw new HttpsError("internal", `設定管理員失敗：${targetUid}，詳細錯誤：${error.message}`);
  }
});

/**
 * 撤銷管理員權限
 */
export const revokeAdminRole = onCall(async (request: CallableRequest<{ uid: string }>) => {
  assertAdmin(request);

  const targetUid = request.data.uid;
  if (!targetUid) {
    throw new HttpsError("invalid-argument", "請指定要撤銷的用戶 UID");
  }

 // 禁止撤銷自己
if (request.auth!.uid === targetUid) {
  throw new HttpsError("failed-precondition", "你無法撤銷自己的管理員身份");
}

  try {
    await adminAuth.setCustomUserClaims(targetUid, { admin: false });
    await db.collection("users").doc(targetUid).set({ isAdmin: false }, { merge: true });

    console.log(`[ADMIN_REVOKE] 成功撤銷 UID=${targetUid} 的管理員資格`);
    return { message: `已撤銷管理員資格：${targetUid}` };
  } catch (error: any) {
    console.error(`[ADMIN_REVOKE_ERROR] UID=${targetUid} - ${error.message}`);
    throw new HttpsError("internal", `撤銷管理員失敗：${targetUid}，詳細錯誤：${error.message}`);
  }
});
