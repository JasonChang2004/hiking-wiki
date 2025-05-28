import { getFunctions, httpsCallable } from "firebase/functions"
import { app } from "./index";

// 建立 Functions 實例（若有 region 需指定，如 'asia-east1'）
export const functions = getFunctions(app)

export const grantAdminRole = async (uid: string) => {
  const fn = httpsCallable(functions, 'grantAdminRole')
  const result = await fn({ uid })
  return result.data
}

export const revokeAdminRole = async (uid: string) => {
  const fn = httpsCallable(functions, 'revokeAdminRole')
  const result = await fn({ uid })
  return result.data
}
