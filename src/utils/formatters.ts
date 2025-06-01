// src/utils/formatters.ts
export const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  // Firestore Timestamp to Date conversion
  const d = timestamp?.toDate?.(); 
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    // If it's already a Date object (e.g., from new Date() in tests or non-Firestore source)
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      // Use it directly
    } else {
      return ''; // Invalid or null timestamp
    }
  }

  const dateToFormat = (d instanceof Date && !isNaN(d.getTime())) ? d : timestamp;


  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return dateToFormat.toLocaleDateString('zh-TW', options);
};

export const formatDateTime = (timestamp: any): string => {
  if (!timestamp) return '';
  // Firestore Timestamp to Date conversion
  const d = timestamp?.toDate?.(); 
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      // Use it directly
    } else {
      return ''; // Invalid or null timestamp
    }
  }
  const dateToFormat = (d instanceof Date && !isNaN(d.getTime())) ? d : timestamp;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return dateToFormat.toLocaleDateString('zh-TW', options);
};

/**
 * 將Markdown文本轉換為純文字，移除所有Markdown語法
 * @param content Markdown內容
 * @param maxLength 最大長度（可選）
 * @returns 純文字內容
 */
export const markdownToPlainText = (content: string, maxLength?: number): string => {
  if (!content) return '暫無內容描述...';
  
  let plainText = content
    // 移除HTML標籤
    .replace(/<[^>]*>/g, '')
    // 移除標題語法 (###, ##, #)
    .replace(/#{1,6}\s+/g, '')
    // 移除粗體和斜體 (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 移除刪除線 (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // 移除內聯代碼 (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // 移除代碼塊 (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // 處理圖片 ![alt](url) - 顯示為 [圖片: alt]
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, (match, alt) => {
      return alt ? `[圖片: ${alt}]` : '[圖片]'
    })
    // 處理連結 [text](url) 或 [text][ref] - 保留連結文字
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]+\]/g, '$1')
    // 移除水平線 (---, ***, ___)
    .replace(/^[-*_]{3,}$/gm, '')
    // 移除列表標記 (-, *, +, 1.)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 移除引用標記 (>)
    .replace(/^>\s*/gm, '')
    // 移除表格語法 (|)
    .replace(/\|/g, ' ')
    // 移除多餘的空白和換行
    .replace(/\s+/g, ' ')
    .trim();

  // 如果指定了最大長度，進行截斷
  if (maxLength && plainText.length > maxLength) {
    plainText = plainText.substring(0, maxLength) + '...';
  }

  return plainText || '暫無內容描述...';
};

/**
 * 取得文章摘要（使用markdownToPlainText的便捷函數）
 * @param content 文章內容
 * @param maxLength 最大長度，預設120字
 * @returns 文章摘要
 */
export const getArticleExcerpt = (content: string, maxLength: number = 120): string => {
  return markdownToPlainText(content, maxLength);
};

/**
 * 為文章預覽生成更友好的摘要，包含圖片和連結提示
 * @param content 文章內容
 * @param maxLength 最大長度，預設120字
 * @returns 文章摘要
 */
export const getArticlePreview = (content: string, maxLength: number = 120): string => {
  if (!content) return '暫無內容描述...';
  
  let preview = content
    // 移除HTML標籤
    .replace(/<[^>]*>/g, '')
    // 移除標題語法但保留內容
    .replace(/#{1,6}\s+/g, '')
    // 保留粗體和斜體的內容
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 移除刪除線
    .replace(/~~(.*?)~~/g, '$1')
    // 移除代碼標記但保留內容
    .replace(/`([^`]+)`/g, '$1')
    // 移除代碼塊
    .replace(/```[\s\S]*?```/g, '[代碼區塊]')
    // 完全移除圖片，不顯示任何提示
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // 處理連結，保留文字並添加特殊標記以便CSS樣式化
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '<link>$1</link>')
    .replace(/\[([^\]]+)\]\[[^\]]+\]/g, '<link>$1</link>')
    // 移除水平線
    .replace(/^[-*_]{3,}$/gm, '')
    // 處理列表，保留內容但簡化格式
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    .replace(/^[\s]*\d+\.\s+/gm, '• ')
    // 處理引用，保留內容但簡化格式
    .replace(/^>\s*/gm, '💬 ')
    // 移除表格語法
    .replace(/\|/g, ' ')
    // 整理空白和換行
    .replace(/\n\s*\n/g, ' ') // 多個換行變成單個空格
    .replace(/\s+/g, ' ') // 多個空格變成單個空格
    .trim();

  // 如果指定了最大長度，進行截斷
  if (maxLength && preview.length > maxLength) {
    // 嘗試在句號、驚嘆號或問號處截斷，避免截斷在單詞中間
    const cutOff = preview.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      cutOff.lastIndexOf('。'),
      cutOff.lastIndexOf('！'),
      cutOff.lastIndexOf('？'),
      cutOff.lastIndexOf('.'),
      cutOff.lastIndexOf('!'),
      cutOff.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > maxLength * 0.7) {
      // 如果找到合適的句號且不會截得太短，在句號處截斷
      preview = preview.substring(0, lastSentenceEnd + 1) + '...';
    } else {
      // 否則直接截斷並加省略號
      preview = preview.substring(0, maxLength) + '...';
    }
  }

  return preview || '暫無內容描述...';
};
