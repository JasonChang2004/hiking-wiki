// 環境配置管理
interface AppConfig {
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId?: string
  }
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
  api: {
    baseUrl: string
    timeout: number
  }
  features: {
    enableAnalytics: boolean
    enableDebug: boolean
    enableServiceWorker: boolean
  }
}

// 從環境變數獲取配置，提供預設值
export const config: AppConfig = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC4qSIZpDf3V_jTeLmq4LMArdIDzFLxn1o",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hiking-wiki.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hiking-wiki",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hiking-wiki.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "583216528006",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:583216528006:web:328433b8aa1190d4662f07",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JJ52EW7YE7"
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || '台灣登山知識庫',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: (import.meta.env.VITE_APP_ENVIRONMENT as AppConfig['app']['environment']) || 'development'
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.DEV,
    enableServiceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false'
  }
}

// 開發模式下的除錯資訊
if (config.features.enableDebug) {
  console.log('應用程式配置:', config)
}

// 驗證必要的環境變數
export function validateEnvironment(): void {
  const requiredVars = [
    'firebase.apiKey',
    'firebase.authDomain',
    'firebase.projectId'
  ]

  const missing = requiredVars.filter(path => {
    const keys = path.split('.')
    let current: any = config
    for (const key of keys) {
      current = current[key]
      if (!current) return true
    }
    return false
  })

  if (missing.length > 0) {
    console.error('缺少必要的環境變數:', missing)
    throw new Error(`缺少必要的環境變數: ${missing.join(', ')}`)
  }
}

// 導出常用的配置常數
export const {
  firebase: firebaseConfig,
  app: appConfig,
  api: apiConfig,
  features: featureFlags
} = config

export default config 