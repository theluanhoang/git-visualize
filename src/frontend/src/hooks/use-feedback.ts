import { Feedback } from "@/types/feedback";
import { useState } from "react";

export const useFeedback = () => {
    const [feedback, setFeedback] = useState<Feedback | null>(null);
  
    const showFeedback = (newFeedback: Omit<Feedback, 'id'>) => {
      setFeedback(newFeedback as Feedback);
    };
  
    const hideFeedback = () => {
      setFeedback(null);
    };
  
    const showSuccess = (title: string, message: string, action?: Feedback['action']) => {
      showFeedback({
        type: 'success',
        title,
        message,
        action,
        autoHide: true,
        duration: 3000
      });
    };
  
    const showError = (title: string, message: string, action?: Feedback['action']) => {
      showFeedback({
        type: 'error',
        title,
        message,
        action,
        autoHide: true,
        duration: 4000
      });
    };
  
    const showHint = (title: string, message: string, action?: Feedback['action']) => {
      showFeedback({
        type: 'hint',
        title,
        message,
        action,
        autoHide: false
      });
    };
  
    const showCongratulations = (title: string, message: string, action?: Feedback['action']) => {
      showFeedback({
        type: 'congratulations',
        title,
        message,
        action,
        autoHide: false
      });
    };

    const showEpicSuccess = (title: string, message: string, action?: Feedback['action']) => {
      showFeedback({
        type: 'congratulations',
        title,
        message,
        action,
        autoHide: false,
        isEpic: true 
      });
    };
  
    return {
      feedback,
      showFeedback,
      hideFeedback,
      showSuccess,
      showError,
      showHint,
      showCongratulations,
      showEpicSuccess
    };
  };