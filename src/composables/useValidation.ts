import { ref, computed } from 'vue'

export interface ValidationRule {
  validator: (value: any) => boolean
  message: string
}

export interface FieldValidation {
  value: any
  rules: ValidationRule[]
  touched: boolean
  error: string | null
}

export function useValidation<T extends Record<string, any>>(initialValues: T) {
  // 簡化的響應式字段管理
  const fields = ref<Record<string, FieldValidation>>({})
  const isSubmitting = ref(false)

  // 初始化字段
  Object.keys(initialValues).forEach(key => {
    fields.value[key] = {
      value: initialValues[key],
      rules: [],
      touched: false,
      error: null
    }
  })

  // 常用驗證規則
  const rules = {
    required: (message = '此欄位為必填'): ValidationRule => ({
      validator: (value: any) => {
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        return value !== null && value !== undefined
      },
      message
    }),

    minLength: (length: number, message?: string): ValidationRule => ({
      validator: (value: string) => !value || value.length >= length,
      message: message || `最少需要 ${length} 個字符`
    }),

    maxLength: (length: number, message?: string): ValidationRule => ({
      validator: (value: string) => !value || value.length <= length,
      message: message || `最多允許 ${length} 個字符`
    }),

    email: (message = '請輸入有效的電子郵件地址'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      },
      message
    }),

    url: (message = '請輸入有效的網址'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      },
      message
    }),

    pattern: (regex: RegExp, message: string): ValidationRule => ({
      validator: (value: string) => !value || regex.test(value),
      message
    }),

    custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
      validator,
      message
    })
  }

  // 設置字段規則
  const setFieldRules = (fieldName: string, fieldRules: ValidationRule[]) => {
    if (fields.value[fieldName]) {
      fields.value[fieldName].rules = fieldRules
    }
  }

  // 驗證單個字段
  const validateField = (fieldName: string): boolean => {
    const field = fields.value[fieldName]
    if (!field) return true

    field.touched = true
    field.error = null

    for (const rule of field.rules) {
      if (!rule.validator(field.value)) {
        field.error = rule.message
        return false
      }
    }

    return true
  }

  // 驗證所有字段
  const validateAll = (): boolean => {
    let isValid = true
    
    Object.keys(fields.value).forEach(key => {
      const fieldValid = validateField(key)
      if (!fieldValid) isValid = false
    })

    return isValid
  }

  // 清除字段錯誤
  const clearFieldError = (fieldName: string) => {
    if (fields.value[fieldName]) {
      fields.value[fieldName].error = null
    }
  }

  // 清除所有錯誤
  const clearAllErrors = () => {
    Object.keys(fields.value).forEach(key => {
      fields.value[key].error = null
      fields.value[key].touched = false
    })
  }

  // 重置表單
  const resetForm = () => {
    Object.keys(fields.value).forEach(key => {
      fields.value[key].value = initialValues[key]
      fields.value[key].error = null
      fields.value[key].touched = false
    })
    isSubmitting.value = false
  }

  // 設置字段值
  const setFieldValue = (fieldName: string, value: any) => {
    if (fields.value[fieldName]) {
      fields.value[fieldName].value = value
    }
  }

  // 獲取表單數據
  const getFormData = (): T => {
    const data = {} as T
    Object.keys(fields.value).forEach(key => {
      data[key as keyof T] = fields.value[key].value
    })
    return data
  }

  // 計算屬性
  const hasErrors = computed(() => 
    Object.values(fields.value).some(field => field.error !== null)
  )

  const isFormValid = computed(() => 
    Object.values(fields.value).every(field => {
      if (!field.touched) return true
      return field.error === null
    })
  )

  const isDirty = computed(() => 
    Object.keys(fields.value).some(key => 
      fields.value[key].value !== initialValues[key]
    )
  )

  const touchedFields = computed(() => 
    Object.keys(fields.value).filter(key => fields.value[key].touched)
  )

  return {
    // 狀態
    fields,
    isSubmitting,
    
    // 驗證規則
    rules,
    
    // 方法
    setFieldRules,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
    resetForm,
    setFieldValue,
    getFormData,
    
    // 計算屬性
    hasErrors,
    isFormValid,
    isDirty,
    touchedFields
  }
} 