/**
 * HTML 轉 Markdown 工具函數
 */

export function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === '') return '';
  
  // 清理輸入的 HTML，移除多餘的空白和換行
  let cleanHtml = html.trim();
  
  // 創建一個臨時 div 來解析 HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  
  let result = processNode(tempDiv).trim();
  
  // 清理結果，移除多餘的空行
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
  result = result.replace(/^\s+|\s+$/g, '');
  
  return result;
}

function processNode(node: Node): string {
  let result = '';
  
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element;
      const tagName = element.tagName.toLowerCase();
      const content = processNode(element);
      
      switch (tagName) {
        case 'h1':
          result += `# ${content}\n\n`;
          break;
        case 'h2':
          result += `## ${content}\n\n`;
          break;
        case 'h3':
          result += `### ${content}\n\n`;
          break;
        case 'h4':
          result += `#### ${content}\n\n`;
          break;
        case 'h5':
          result += `##### ${content}\n\n`;
          break;
        case 'h6':
          result += `###### ${content}\n\n`;
          break;
        case 'p':
          const align = (element as HTMLElement).style.textAlign;
          if (align && align !== 'left' && align !== '') {
            result += `<p style="text-align: ${align}">${content}</p>\n\n`;
          } else {
            result += `${content}\n\n`;
          }
          break;
        case 'strong':
        case 'b':
          // 確保粗體標記正確轉換，並處理嵌套情況
          if (content.trim()) {
            result += `**${content.trim()}**`;
          }
          break;
        case 'em':
        case 'i':
          // 確保斜體標記正確轉換
          if (content.trim()) {
            result += `*${content.trim()}*`;
          }
          break;
        case 'u':
          if (content.trim()) {
            result += `<u>${content}</u>`;
          }
          break;
        case 's':
        case 'strike':
          if (content.trim()) {
            result += `~~${content.trim()}~~`;
          }
          break;
        case 'a':
          const href = element.getAttribute('href');
          result += href ? `[${content}](${href})` : content;
          break;
        case 'blockquote':
          const lines = content.split('\n').filter(line => line.trim());
          result += lines.map(line => `> ${line}`).join('\n') + '\n\n';
          break;
        case 'pre':
          result += `\`\`\`\n${content}\n\`\`\`\n\n`;
          break;
        case 'code':
          if (element.parentElement?.tagName.toLowerCase() !== 'pre') {
            result += `\`${content}\``;
          } else {
            result += content;
          }
          break;
        case 'ul':
          result += processListItems(element, '-') + '\n';
          break;
        case 'ol':
          result += processListItems(element, '1.') + '\n';
          break;
        case 'li':
          // 由父層的 ul/ol 處理
          result += content;
          break;
        case 'br':
          result += '\n';
          break;
        case 'div':
          const divAlign = (element as HTMLElement).style.textAlign;
          if (divAlign && divAlign !== 'left' && divAlign !== '') {
            result += `<div style="text-align: ${divAlign}">${content}</div>\n\n`;
          } else {
            result += `${content}\n`;
          }
          break;
        default:
          result += content;
          break;
      }
    }
  }
  
  return result;
}

function processListItems(listElement: Element, marker: string): string {
  let result = '';
  const items = listElement.querySelectorAll('li');
  
  items.forEach((li, index) => {
    const content = processNode(li).trim();
    const currentMarker = marker === '1.' ? `${index + 1}.` : marker;
    result += `${currentMarker} ${content}\n`;
  });
  
  return result;
}

/**
 * Markdown 轉 HTML 工具函數 (簡化版，主要用於預覽)
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // 標題
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 粗體和斜體
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 刪除線
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
  
  // 連結
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 引用
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // 程式碼區塊
  html = html.replace(/```([^`]*)```/g, '<pre><code>$1</code></pre>');
  
  // 行內程式碼
  html = html.replace(/`([^`]*)`/g, '<code>$1</code>');
  
  // 列表
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // 段落
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // 清理空段落
  html = html.replace(/<p><\/p>/g, '');
  
  return html;
}
