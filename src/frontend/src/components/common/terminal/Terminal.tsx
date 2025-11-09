import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form';
import { useGitEngine } from '@/lib/react-query/hooks/use-git-engine';

export interface TerminalLine {
    type: 'command' | 'output' | 'success' | 'error';
    text: string;
    timestamp?: number;
}

interface TerminalProps {
    practiceId?: string;
    // Preview mode props
    previewLines?: TerminalLine[];
    isTyping?: boolean;
    showInput?: boolean;
    className?: string;
}

function Terminal({ practiceId, previewLines, isTyping = false, showInput = true, className = '' }: TerminalProps) {
    const t = useTranslations('terminal');
    const outputRef = useRef<HTMLDivElement>(null);
    const isPreviewMode = previewLines !== undefined;
    
    const { responses, runCommand } = useGitEngine(practiceId);
    const [isFocused, setIsFocused] = useState(false);
    const { register, handleSubmit, reset, watch } = useForm<{ command: string }>();
    const commandValue = watch('command') ?? '';
    const measureRef = useRef<HTMLSpanElement>(null);
    const [cursorLeft, setCursorLeft] = useState(0);

    const displayResponses = isPreviewMode ? previewLines.map(line => ({
        command: line.type === 'command' ? line.text : undefined,
        output: line.type !== 'command' ? line.text : '',
        success: line.type === 'success' ? true : line.type === 'error' ? false : undefined
    })) : responses;

    const onSubmit = async ({ command }: { command: string }) => {
        if (isPreviewMode) return;
        if (command.trim()) {
            await runCommand(command.trim());
            reset({ command: "" });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (isPreviewMode) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [displayResponses]);

    useEffect(() => {
        if (measureRef.current) {
            const rect = measureRef.current.getBoundingClientRect();
            setCursorLeft(rect.width);
        }
    }, [commandValue]);

    const getLineColor = (type: 'command' | 'success' | 'error' | 'output') => {
        switch (type) {
            case 'command':
                return 'text-blue-600 dark:text-blue-400';
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className={`w-full font-mono rounded-lg flex overflow-hidden flex-col h-[300px] bg-terminal-bg border border-[var(--border)] shadow-sm ${className}`}>
            {}
            <div className="flex items-center justify-between px-4 py-2 bg-terminal-header border-b border-[var(--border)]">
                <div className="text-sm text-gray-700 dark:text-gray-300">{t('title')}</div>
                <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </div>

            {}
            <div
                ref={outputRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-1 terminal-scrollbar"
                style={{
                    maxHeight: 'calc(100%)'
                }}
            >
                <AnimatePresence>
                    {displayResponses.map((response, index) => {
                        return (
                            <motion.div
                                key={`${response.command ?? ''}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-pre-wrap text-sm"
                            >
                                {response.command && (
                                    <div className={getLineColor('command')}>
                                        <span className="text-gray-500 dark:text-gray-400">$ </span>
                                        {response.command}
                                    </div>
                                )}
                                {response.output && (
                                    <div className={getLineColor(response.success === false ? 'error' : response.success === true ? 'success' : 'output')}>
                                        {response.output}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                    {isPreviewMode && isTyping && (
                        <motion.div
                            className="text-blue-600 dark:text-blue-400 flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <span className="text-gray-500 dark:text-gray-400">$ </span>
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="inline-block w-2 h-4 bg-blue-600 dark:bg-blue-400 ml-1"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showInput && !isPreviewMode && (
                <>
                <div className="px-4 py-2 bg-gray-50 dark:bg-[#161b22] border-t border-[var(--border)]">
                    <form onKeyDown={handleKeyDown} className="flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 mr-4 text-sm">$</span>
                        <div className="relative flex-1">
                            <span
                                ref={measureRef}
                                className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 whitespace-pre font-mono text-sm"
                            >
                                {commandValue}
                            </span>
                            {isFocused && (
                                <motion.span
                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-blue-600 dark:bg-blue-400 pointer-events-none"
                                    style={{ left: commandValue.length === 0 ? 0 : cursorLeft }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            )}
                            {(() => {
                            const { ref, onChange, onBlur: rhfOnBlur, name } = register("command");
                            return (
                                <input
                            type="text"
                                    className="w-full bg-transparent text-blue-600 dark:text-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none text-sm"
                                    style={{ caretColor: isFocused ? 'transparent' : undefined }}
                            placeholder={t('placeholder')}
                            aria-label={t('placeholder')}
                            autoFocus
                            autoComplete="off"
                                    name={name}
                                    ref={ref}
                                    onChange={onChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => { rhfOnBlur(e); setIsFocused(false); }}
                                />
                            );
                            })()}
                        </div>
                    </form>
                </div>
                </>
            )}

            {}
            <style jsx global>
                {`
                  .terminal-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgb(209 213 219) rgb(255 255 255);
                  }
                  
                  html.dark .terminal-scrollbar,
                  .dark .terminal-scrollbar,
                  [data-theme="dark"] .terminal-scrollbar {
                    scrollbar-color: rgb(55 65 81) rgb(13 17 23);
                  }
                  
                  .terminal-scrollbar::-webkit-scrollbar {
                    width: 6px;
                  }
                  
                  .terminal-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 3px;
                  }
                  
                  .terminal-scrollbar::-webkit-scrollbar-thumb {
                    background: rgb(209 213 219);
                    border-radius: 3px;
                    border: none;
                    transition: background-color 0.2s ease;
                  }
                  
                  html.dark .terminal-scrollbar::-webkit-scrollbar-thumb,
                  .dark .terminal-scrollbar::-webkit-scrollbar-thumb,
                  [data-theme="dark"] .terminal-scrollbar::-webkit-scrollbar-thumb {
                    background: rgb(55 65 81);
                  }
                  
                  .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgb(156 163 175);
                  }
                  
                  html.dark .terminal-scrollbar::-webkit-scrollbar-thumb:hover,
                  .dark .terminal-scrollbar::-webkit-scrollbar-thumb:hover,
                  [data-theme="dark"] .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgb(75 85 99);
                  }
                  
                  .terminal-scrollbar::-webkit-scrollbar-thumb:active {
                    background: rgb(107 114 128);
                  }
                  
                  html.dark .terminal-scrollbar::-webkit-scrollbar-thumb:active,
                  .dark .terminal-scrollbar::-webkit-scrollbar-thumb:active,
                  [data-theme="dark"] .terminal-scrollbar::-webkit-scrollbar-thumb:active {
                    background: rgb(107 114 128);
                  }
                  
                  .terminal-scrollbar::-webkit-scrollbar-corner {
                    background: transparent;
                  }
              `}
            </style>
        </div>
    )
}

export default Terminal