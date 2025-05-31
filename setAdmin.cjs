const admin = require('firebase-admin');

// 【【【 請修改以下兩行 】】】
// 1. 將 'path/to/your/downloaded/serviceAccountKey.json' 替換成你實際下載的服務帳號金鑰 JSON 檔案的路徑。
//    在 Windows 上，路徑可能像 'C:/Users/YourName/Downloads/your-project-id-firebase-adminsdk-xxxx.json'
//    記得在 JavaScript 字串中，路徑的反斜線 \ 需要被轉義成 \\，或者直接使用正斜線 /。
const serviceAccountKeyPath = 'C:\\Users\\jason\\Downloads\\hiking-wiki-firebase-adminsdk-fbsvc-1e55ba4be5.json';

// 2. 將 'YOUR_ADMIN_USER_UID_HERE' 替換成你想要設為管理員的使用者的 UID。
const targetUserUid = 'Se1nsl0LhPVa7AyxZxJSOJwqtrQ2';
// 【【【 修改結束 】】】

try {
  const serviceAccount = require(serviceAccountKeyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  if (!targetUserUid) {
    throw new Error('Target User UID (targetUserUid) is not set in the script.');
  }

  admin.auth().setCustomUserClaims(targetUserUid, { admin: true })
    .then(() => {
      console.log(`✅ Successfully set 'admin: true' custom claim for user: ${targetUserUid}`);
      // 與你的 Cloud Function 邏輯一致，同時更新 Firestore 'users' 集合中的 isAdmin 欄位
      return admin.firestore().collection('users').doc(targetUserUid).set({ isAdmin: true }, { merge: true });
    })
    .then(() => {
      console.log(`✅ Successfully updated 'isAdmin: true' field in Firestore for user: ${targetUserUid}`);
      console.log('\n🎉 Admin setup complete! Please log out and log back into your web application to refresh the ID token.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error setting custom user claims or updating Firestore:', error.message);
      console.error('Full error object:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK or read service account key.');
  console.error('Please ensure "serviceAccountKeyPath" is correct and the file exists, and that "firebase-admin" is installed.');
  console.error('Error details:', error.message);
  process.exit(1);
}
