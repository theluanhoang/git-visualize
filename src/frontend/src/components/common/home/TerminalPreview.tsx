'use client';

import Terminal, { TerminalLine } from '../terminal/Terminal';

interface TerminalPreviewProps {
  lines: TerminalLine[];
  isTyping?: boolean;
}

export default function TerminalPreview({ lines, isTyping = false }: TerminalPreviewProps) {
  return (
    <Terminal
      previewLines={lines}
      isTyping={isTyping}
      showInput={false}
      className="h-full"
    />
  );
}
