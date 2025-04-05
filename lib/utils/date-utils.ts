// lib/utils/date-utils.ts

/**
 * Format a date in a relative way (e.g., "2 hours ago", "yesterday", "3 days ago")
 * For dates older than a week, returns a formatted date string
 */
export function formatRelativeTime(date: Date | string): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    
    // Convert to different time units
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Format based on the time difference
    if (diffSeconds < 60) {
      return diffSeconds <= 5 ? 'just now' : `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      if (diffDays === 1) {
        return 'yesterday';
      }
      return `${diffDays} days ago`;
    } else {
      // For older dates, show the actual date
      return formatDate(parsedDate);
    }
  }
  
  /**
   * Format a date for display in a standard format (e.g., "Apr 15, 2025")
   */
  export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    
    return parsedDate.toLocaleDateString('en-US', options || defaultOptions);
  }
  
  /**
   * Format a date and time for display (e.g., "Apr 15, 2025, 2:30 PM")
   */
  export function formatDateTime(date: Date | string): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    return parsedDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }
  
  /**
   * Format a time for display (e.g., "2:30 PM")
   */
  export function formatTime(date: Date | string): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    return parsedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }
  
  /**
   * Format a deadline date with appropriate messaging
   */
  export function formatDeadline(date: Date | string | null): string {
    if (!date) return 'No deadline';
    
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = parsedDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due on ${formatDate(parsedDate)}`;
    }
  }
  
  /**
   * Check if a date is today
   */
  export function isToday(date: Date | string): boolean {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return (
      parsedDate.getDate() === today.getDate() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear()
    );
  }
  
  /**
   * Check if a date is yesterday
   */
  export function isYesterday(date: Date | string): boolean {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      parsedDate.getDate() === yesterday.getDate() &&
      parsedDate.getMonth() === yesterday.getMonth() &&
      parsedDate.getFullYear() === yesterday.getFullYear()
    );
  }
  
  /**
   * Format dates for chat messages with smart grouping
   * Returns either "Today", "Yesterday", or a formatted date
   */
  export function formatMessageDate(date: Date | string): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isToday(parsedDate)) {
      return 'Today';
    } else if (isYesterday(parsedDate)) {
      return 'Yesterday';
    } else {
      return formatDate(parsedDate);
    }
  }