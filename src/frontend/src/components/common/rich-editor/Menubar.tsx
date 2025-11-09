'use client';

import { Bold, CodeXml, Italic, Strikethrough, Code } from 'lucide-react';
import React, { memo } from 'react';
import FontSelection from './FontSelection';
import TextSelection from './TextSelection';
import FontSizeSelection from './FontSizeSelection';
import TextAlignSelection from './TextAlignSelection';
import { Editor, useEditorState } from '@tiptap/react';
import HighlightColorPicker from './HighlightColorPicker';
import ListButtons from './ListButtons';
import SubSupButtons from './SubSupButtons';
import TextColorPicker from './TextColorPicker';
import LinkButton from './LinkButton';
import { Button } from '@/components/ui/button';

const Menubar = memo(({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            if (!ctx.editor) return { isLink: false };
            return {
                isLink: ctx.editor.isActive("link"),
                isBold: ctx.editor.isActive("bold"),
                isItalic: ctx.editor.isActive("italic"),
                isStrike: ctx.editor.isActive("strike"),
                isCodeBlock: ctx.editor.isActive("codeBlock"),
                isInlineCode: ctx.editor.isActive("code"),
            };
        },
    });

    return (
        <div className="flex items-center justify-center border-b p-2 bg-[color:var(--muted)] border-[var(--border)] text-[color:var(--foreground)]">
            <div className="flex items-center gap-1">
                <FontSelection editor={editor} />
                <TextSelection editor={editor} />
                <FontSizeSelection editor={editor} />
                <TextAlignSelection editor={editor} />
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button
                    variant="ghost"
                    title="Bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`${editorState?.isBold ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[color:var(--secondary)]'}`}
                >
                    <Bold />
                </Button>
                <Button
                    variant="ghost"
                    title="Italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`${editorState?.isItalic ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[color:var(--secondary)]'}`}
                >
                    <Italic />
                </Button>
                <Button
                    variant="ghost"
                    title="Strike"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`${editorState?.isStrike ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[color:var(--secondary)]'}`}
                >
                    <Strikethrough />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <ListButtons editor={editor} />
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <SubSupButtons editor={editor} />
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <LinkButton editor={editor} />
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <TextColorPicker editor={editor} />
                <HighlightColorPicker editor={editor} />
                <Button
                    variant="ghost"
                    title="Inline code"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`${editorState?.isInlineCode ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[color:var(--secondary)]'}`}
                >
                    <Code />
                </Button>
                <Button
                    variant="ghost"
                    title="Code block"
                    onClick={() => editor.commands.toggleCodeBlock()}
                    className={`${editorState?.isCodeBlock ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[color:var(--secondary)]'}`}
                >
                    <CodeXml />
                </Button>
            </div>
        </div>
    );
});

Menubar.displayName = 'Menubar';

export default Menubar;