'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useEffect, useState } from 'react';

export default function CodeBlock({ node, updateAttributes, editor }: NodeViewProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(true);
  const [title, setTitle] = useState<string>(node.attrs.title || '');
  const [description, setDescription] = useState<string>(node.attrs.description || '');
  const language = (node.attrs.language as string) || 'bash';
  const code = node.textContent || '';
  const isBash = language.toLowerCase() === 'bash' || language.toLowerCase() === 'sh';
  const isEmpty = !code.trim();
  const isEditable = !!editor?.isEditable;
  const TITLE_MAX = 80;
  const DESCRIPTION_MAX = 160;

  const copyToClipboard = async (): Promise<void> => {
    try {
      let textToCopy = code;

      if (isBash) {
        textToCopy = code
          .split('\n')
          .map(line => {
            return line.replace(/^\$\s?/, '');
          })
          .join('\n')
          .trim();
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleLanguageChange = (value: string): void => {
    const newLanguage = value;
    const oldIsBash = isBash;
    const newIsBash = newLanguage.toLowerCase() === 'bash' || newLanguage.toLowerCase() === 'sh';

    updateAttributes({ language: newLanguage });

    if (editor) {
      editor.commands.command(({ tr, state }) => {
        const { selection } = state;
        const { $from } = selection;
        const content = $from.parent.textContent;
        const pos = $from.start();

        if (!oldIsBash && newIsBash) {
          const trimmed = content.trim();
          if (!trimmed || (!trimmed.startsWith('$ ') && !trimmed.startsWith('$'))) {
            tr.insertText('$ ', pos);
          }
        } else if (oldIsBash && !newIsBash) {
          if (content.startsWith('$ ')) {
            tr.delete(pos, pos + 2);
          } else if (content.startsWith('$')) {
            tr.delete(pos, pos + 1);
          }
        }

        return true;
      });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateAttributes({ title: newTitle });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    updateAttributes({ description: newDescription });
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  useEffect(() => {
    setTitle(node.attrs.title || '');
  }, [node.attrs.title]);

  useEffect(() => {
    setDescription(node.attrs.description || '');
  }, [node.attrs.description]);

  return (
    <NodeViewWrapper className="code-block-wrapper not-prose">
      <Card className="rounded-lg shadow-sm my-4 gap-0 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]">
        <CardHeader className="flex items-center justify-between px-4" contentEditable={false}>
          <div className="flex items-center gap-3">
            <p className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-[color:var(--muted)] border-[var(--border)] text-[color:var(--foreground)]">
              {language}
            </p>
            {isEditable && (
              <Select
                value={language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="text-xs rounded px-2 py-1 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ height: '25px' }}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="tsx">TSX</SelectItem>
                  <SelectItem value="jsx">JSX</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="bash">Bash</SelectItem>
                  <SelectItem value="sh">Shell</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="swift">Swift</SelectItem>
                  <SelectItem value="kotlin">Kotlin</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={copyToClipboard}
              className="cursor-pointer px-3 py-1.5 rounded-md border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[color:var(--secondary)]"
              disabled={isEmpty}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </Button>
            <Button
              onClick={toggleHide}
              className="cursor-pointer px-3 py-1.5 rounded-md border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[color:var(--secondary)]"
            >
              {isHidden ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {isEditable ? (
          <div className="px-4 py-3" contentEditable={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1 opacity-80">Title</label>
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Nhập tiêu đề (tối đa 80 ký tự)"
                  maxLength={TITLE_MAX}
                  className="text-sm rounded-md px-3 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 text-[11px] opacity-60">{title.length}/{TITLE_MAX}</div>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1 opacity-80">Description</label>
                <Input
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Mô tả ngắn (tối đa 160 ký tự)"
                  maxLength={DESCRIPTION_MAX}
                  className="text-sm rounded-md px-3 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 text-[11px] opacity-60">{description.length}/{DESCRIPTION_MAX}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4" contentEditable={false}>
            {title ? (
              <p className="text-[24px] font-bold my-0">{title}</p>
            ) : null}
            {description ? (
              <p className="text-[14px] opacity-80">{description}</p>
            ) : null}
          </div>
        )}
        {
          isHidden && (
            <CardContent className="px-4 pb-4 mt-2">
              <div className="h-full w-full font-mono rounded-lg flex flex-col border bg-[#0b1220] text-[#a7f3d0] border-[#0f172a]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#111827] border border-[#1f2937] rounded-t-lg" contentEditable={false}>
                  <div className="text-xs opacity-80 text-green-400">{language} terminal</div>
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="px-3 py-2 overflow-x-auto terminal-scrollbar min-h-[100px] relative">
                  <div className="text-sm leading-relaxed">
                    <NodeViewContent
                      className="inline-block whitespace-pre font-mono min-w-full outline-none align-top text-green-400"
                    />
                  </div>
                  {isEmpty && (
                    <div className="opacity-60 text-sm italic pointer-events-none absolute top-2 left-[26px]" contentEditable={false}>
                      Enter your {language} commands...
                    </div>
                  )}
                </div>
                <style jsx>{`
              .terminal-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
              .terminal-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
              .terminal-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; border: 1px solid #0f172a; }
              .terminal-scrollbar::-webkit-scrollbar-thumb:hover { background: #374151; }
              .terminal-scrollbar::-webkit-scrollbar-thumb:active { background: #4b5563; }
              .terminal-scrollbar::-webkit-scrollbar-corner { background: #0f172a; }
            `}</style>
              </div>
            </CardContent>
          )
        }
      </Card>
    </NodeViewWrapper>
  );
}