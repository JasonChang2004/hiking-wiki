import { db } from './index'
import { doc, getDoc } from 'firebase/firestore'

export const checkIsAdmin = async (uid: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  return userDoc.exists() && userDoc.data().isAdmin === true
}
