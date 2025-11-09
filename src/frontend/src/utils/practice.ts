
export const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1: 
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 2: 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 3: 
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
export const getDifficultyText = (difficulty: number): string => {
  switch (difficulty) {
    case 1: 
      return 'Beginner';
    case 2: 
      return 'Intermediate';
    case 3: 
      return 'Advanced';
    default: 
      return 'Unknown';
  }
};
export const getDifficultyIcon = (difficulty: number): string => {
  switch (difficulty) {
    case 1: 
      return '🟢'; // Green circle
    case 2: 
      return '🟡'; // Yellow circle
    case 3: 
      return '🔴'; // Red circle
    default: 
      return '⚪'; // White circle
  }
};
export const getDifficultyDescription = (difficulty: number): string => {
  switch (difficulty) {
    case 1: 
      return 'Perfect for beginners. Basic Git commands and concepts.';
    case 2: 
      return 'Intermediate level. Some Git experience recommended.';
    case 3: 
      return 'Advanced level. Requires solid Git knowledge.';
    default: 
      return 'Difficulty level not specified.';
  }
};
export const getTimeColor = (timeInMinutes: number): string => {
  if (timeInMinutes <= 10) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (timeInMinutes <= 30) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
};
export const formatTime = (timeInMinutes: number): string => {
  if (timeInMinutes < 60) {
    return `${timeInMinutes} min`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};
export const getPracticeStatusColor = (isCompleted: boolean, isActive: boolean): string => {
  if (isCompleted) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (isActive) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
export const getPracticeStatusText = (isCompleted: boolean, isActive: boolean): string => {
  if (isCompleted) {
    return 'Completed';
  } else if (isActive) {
    return 'Active';
  } else {
    return 'Not Started';
  }
};
