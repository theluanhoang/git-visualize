import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCustomCaretOptions {
  value: string;
}

export const useCustomCaret = ({ value }: UseCustomCaretOptions) => {
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [caretPosition, setCaretPosition] = useState(0);
  const [cursorLeft, setCursorLeft] = useState(0);

  useEffect(() => {
    setCaretPosition((prev) => Math.min(prev, value.length));
  }, [value]);

  useEffect(() => {
    if (!measureRef.current) return;
    const rect = measureRef.current.getBoundingClientRect();
    setCursorLeft(rect.width);
  }, [value, caretPosition]);

  const updateCaretPosition = useCallback((target?: HTMLInputElement | null) => {
    if (!target) return;
    setCaretPosition(target.selectionStart ?? target.value.length);
  }, []);

  const scheduleCaretUpdate = useCallback((target: HTMLInputElement) => {
    requestAnimationFrame(() => updateCaretPosition(target));
  }, [updateCaretPosition]);

  const registerInputRef = useCallback((
    node: HTMLInputElement | null,
    forwardedRef?: ((instance: HTMLInputElement | null) => void) | React.MutableRefObject<HTMLInputElement | null> | null
  ) => {
    inputRef.current = node;
    if (!forwardedRef) return;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else {
      forwardedRef.current = node;
    }
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    updateCaretPosition(event.target);
  }, [updateCaretPosition]);

  const handleSelect = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    updateCaretPosition(event.currentTarget);
  }, [updateCaretPosition]);

  const handleKey = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    scheduleCaretUpdate(event.currentTarget);
  }, [scheduleCaretUpdate]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    scheduleCaretUpdate(event.currentTarget);
  }, [scheduleCaretUpdate]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    updateCaretPosition(event.target);
  }, [updateCaretPosition]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    updateCaretPosition(event.target);
  }, [updateCaretPosition]);

  return {
    caretPosition,
    cursorLeft,
    caretStyle: { left: caretPosition === 0 ? 0 : cursorLeft },
    measuredText: value.slice(0, caretPosition),
    measureRef,
    registerInputRef,
    handleChange,
    handleSelect,
    handleKey,
    handleMouseUp,
    handleFocus,
    handleBlur,
    updateCaretPosition,
  };
};




