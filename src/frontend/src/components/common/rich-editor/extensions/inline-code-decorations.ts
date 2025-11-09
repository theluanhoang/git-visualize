'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

function classifyToken(token: string): string | null {
  if (/^(git|brew|sudo|apt|yum|dnf|pacman|npm|pnpm|yarn)$/.test(token)) return 'tok-cmd';
  if (/^--?[\w-]+$/.test(token)) return 'tok-flag';
  if (/^<[^>]+>$/.test(token)) return 'tok-arg';
  if (/[\./]/.test(token)) return 'tok-path';
  return null;
}

function buildDecorations(doc: any): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node: any, pos: number) => {
    if (!node.isText) return;
    const hasInlineCode = node.marks?.some((m: any) => m.type?.name === 'code');
    if (!hasInlineCode) return;
    const text: string = node.text || '';
    const parts = text.split(/(\s+)/);
    let offset = 0;
    for (const part of parts) {
      const cls = classifyToken(part);
      const from = pos + offset;
      const to = from + part.length;
      if (cls && part.length > 0) {
        decorations.push(Decoration.inline(from, to, { class: cls }));
      }
      offset += part.length;
    }
  });
  return DecorationSet.create(doc, decorations);
}

export const InlineCodeDecorations = Extension.create({
  name: 'inlineCodeDecorations',
  addProseMirrorPlugins() {
    const key = new PluginKey('inline-code-decorations');
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => buildDecorations(doc),
          apply(tr, old, _oldState, newState) {
            if (tr.docChanged) {
              return buildDecorations(newState.doc);
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return (key.getState(state) as DecorationSet) || null;
          },
        },
      }),
    ];
  },
});
