import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { HttpsError, onCall, CallableRequest } from "firebase-functions/v2/https";

// 初始化 Firebase Admin SDK
admin.initializeApp();
const db = getFirestore();
const adminAuth = getAdminAuth();

/**
 * 將指定用戶設為管理員
 */
export const grantAdminRole = onCall(async (request: CallableRequest<{ uid: string }>) => {
  // 檢查呼叫者身份 (需有 admin custom claim)
  if (!request.auth || !request.auth.token.admin) {
    console.log('Permission denied: Caller is not an admin or not authenticated.');
    throw new HttpsError('permission-denied', '你必須是管理員才可執行此操作');
  }

  const targetUid = request.data.uid;
  if (!targetUid) {
    throw new HttpsError('invalid-argument', '請指定要升級的用戶 UID');
  }

  try {
    // 設定 custom claim admin: true
    await adminAuth.setCustomUserClaims(targetUid, { admin: true });
    // Firestore 資料同步
    await db.collection('users').doc(targetUid).set({ isAdmin: true }, { merge: true });

    console.log(`✅ 已成功授予管理員給：${targetUid}`);
    return { message: `已成功授予管理員：${targetUid}` };
  } catch (error: any) {
    console.error(`❌ 設定管理員失敗：${targetUid}`, error);
    throw new HttpsError('internal', `設定管理員失敗：${targetUid}，詳細錯誤：${error.message}`);
  }
});

/**
 * 撤銷管理員權限
 */
export const revokeAdminRole = onCall(async (request: CallableRequest<{ uid: string }>) => {
  // 檢查呼叫者身份
  if (!request.auth || !request.auth.token.admin) {
    console.log('Permission denied: Caller is not an admin or not authenticated.');
    throw new HttpsError('permission-denied', '你必須是管理員才可執行此操作');
  }

  const targetUid = request.data.uid;
  if (!targetUid) {
    throw new HttpsError('invalid-argument', '請指定要撤銷的用戶 UID');
  }

  try {
    // 設定 custom claim admin: false
    await adminAuth.setCustomUserClaims(targetUid, { admin: false });
    // Firestore 資料同步
    await db.collection('users').doc(targetUid).set({ isAdmin: false }, { merge: true });

    console.log(`✅ 已撤銷管理員資格：${targetUid}`);
    return { message: `已撤銷管理員資格：${targetUid}` };
  } catch (error: any) {
    console.error(`❌ 撤銷管理員失敗：${targetUid}`, error);
    throw new HttpsError('internal', `撤銷管理員失敗：${targetUid}，詳細錯誤：${error.message}`);
  }
});
