export type FeedbackType = 'success' | 'error' | 'warning' | 'hint' | 'congratulations';

export interface Feedback {
  type: FeedbackType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
  isEpic?: boolean;
}