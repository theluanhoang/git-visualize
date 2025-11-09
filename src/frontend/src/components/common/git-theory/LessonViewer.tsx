'use client';

import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily, TextStyle } from '@tiptap/extension-text-style';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useMemo, useEffect, useRef } from 'react';
import { CustomHighlight } from '../rich-editor/extensions/custom-highlight';
import { CustomFontSize } from '../rich-editor/extensions/custom-fontsize';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { CustomColor } from '../rich-editor/extensions/custom-color';
import { CustomLink } from '../rich-editor/extensions/custom-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CustomCodeBlock } from '../rich-editor/extensions/custom-codeblock';
import { InlineCodeDecorations } from '../rich-editor/extensions/inline-code-decorations';

interface LessonViewerProps {
    content: any; // JSON content từ DB
}

export default function LessonViewer({ content }: LessonViewerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const extensions = useMemo(() => [
        CharacterCount.configure({
            mode: 'textSize',
        }),
        StarterKit.configure({
            codeBlock: false,
            heading: {
                levels: [1, 2, 3, 4, 5, 6],
            },
            bulletList: {
                HTMLAttributes: {
                    class: 'list-disc',
                },
            },
            orderedList: {
                HTMLAttributes: {
                    class: 'list-decimal',
                },
            },
            listItem: {
                HTMLAttributes: {
                    class: 'ml-4',
                },
            },
        }),
        TextStyle,
        FontFamily.configure({
            types: ['textStyle'],
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right', 'justify'],
            defaultAlignment: 'left',
        }),
        CustomHighlight,
        CustomFontSize.configure({
            types: ['textStyle'],
        }),
        Subscript,
        Superscript,
        CustomColor.configure({
            types: ['textStyle'],
        }),
        CustomLink,
        TaskList,
        TaskItem.configure({
            nested: true,
            HTMLAttributes: {
                class: 'task-item',
            },
        }),
        CustomCodeBlock,
        InlineCodeDecorations,
    ], []);

    const editor = useEditor({
        extensions,
        content: content,
        editable: false,
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-sm max-w-none px-4 py-2',
            },
        },
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
    });

    useEffect(() => {
        if (!editor || !content) return;
        try {
            const current = editor.getJSON();
            if (JSON.stringify(current) === JSON.stringify(content)) return;
        } catch {}
        Promise.resolve().then(() => {
            if (editor && content) editor.commands.setContent(content);
        });
    }, [editor, content]);

    useEffect(() => {
        if (!editor) return;
        function decorate() {
            const root = containerRef.current;
            if (!root) return;
            const nodes = root.querySelectorAll(':not(pre) > code');
            nodes.forEach((node) => {
                if ((node as HTMLElement).dataset.__decorated === '1') return;
                const text = node.textContent || '';
                const parts = text.split(/(\s+)/);
                const html = parts
                    .map((part) => {
                        if (/^\s+$/.test(part)) return part;
                        if (/^(git|brew|sudo|apt|yum|dnf|pacman|npm|pnpm|yarn)$/.test(part)) return `<span class="tok-cmd">${part}</span>`;
                        if (/^--?[\w-]+$/.test(part)) return `<span class="tok-flag">${part}</span>`;
                        if (/^<[^>]+>$/.test(part)) return `<span class="tok-arg">${part}</span>`;
                        if (/[\./]/.test(part)) return `<span class="tok-path">${part}</span>`;
                        return `<span>${part}</span>`;
                    })
                    .join('');
                (node as HTMLElement).innerHTML = html;
                (node as HTMLElement).dataset.__decorated = '1';
            });
        }
        decorate();
        const handler = () => decorate();
        editor.on('transaction', handler);
        return () => {
            editor.off('transaction', handler);
        };
    }, [editor]);

    if (!editor) return <div>Loading...</div>;

    return (
        <div ref={containerRef} className="w-full p-6 overflow-hidden rounded-xl shadow-sm border bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]">
            <EditorContent editor={editor} />
        </div>
    );
}