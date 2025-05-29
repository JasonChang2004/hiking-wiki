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
