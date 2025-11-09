'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlock from '../CodeBlock';

export const CustomCodeBlock = Node.create({
  name: 'codeBlock',

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'bash',
        parseHTML: (element) => {
          return element.getAttribute('data-language') ||
            element.getAttribute('class')?.replace('language-', '') ||
            'bash';
        },
        renderHTML: (attributes) => ({
          'data-language': attributes.language,
          class: `language-${attributes.language}`,
        }),
      },
      title: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('data-title') || '';
        },
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      description: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('data-description') || '';
        },
        renderHTML: (attributes) => ({
          'data-description': attributes.description,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (node) => {
          if (typeof node === 'string') return null;
          const codeElement = node.querySelector('code');
          const language = codeElement?.getAttribute('class')?.replace('language-', '') || 'bash';
          return { language };
        },
      },
      {
        tag: 'code',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(HTMLAttributes, {
        'data-language': node.attrs.language,
        'data-title': node.attrs.title || '',
        'data-description': node.attrs.description || '',
      }),
      [
        'code',
        {
          class: `language-${node.attrs.language}`,
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlock, {
      contentDOMElementTag: 'code',
    });
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes?: { language?: string }) =>
          ({ commands }) => {
            return commands.setNode(this.name, { language: attributes?.language || 'bash' });
          },
      toggleCodeBlock:
        (attributes?: { language?: string }) =>
          ({ commands, state, chain }) => {
            const language = attributes?.language || 'bash';
            const isBash = language === 'bash' || language === 'sh';

            if (isBash && !state.selection.empty) {
              const { from, to } = state.selection;
              const selectedText = state.doc.textBetween(from, to, '\n');

              const lines = selectedText.split('\n');
              const formattedText = lines
                .map((line) => {
                  if (!line.trim()) return line;
                  return line.startsWith('$ ') ? line : `$ ${line}`;
                })
                .join('\n');

              return chain()
                .deleteSelection()
                .insertContent({
                  type: this.name,
                  attrs: { language },
                  content: [
                    {
                      type: 'text',
                      text: formattedText,
                    },
                  ],
                })
                .run();
            }

            const { $from } = state.selection;
            const isInParagraph = $from.parent.type.name === 'paragraph';
            
            if (isBash && isInParagraph) {
              const currentContent = $from.parent.textContent;

              const lines = currentContent.split('\n');
              const formattedText = lines
                .map((line) => {
                  if (!line.trim()) return line;
                  return line.startsWith('$ ') ? line : `$ ${line}`;
                })
                .join('\n');

              return chain()
                .deleteRange({ from: $from.start(), to: $from.end() })
                .insertContent({
                  type: this.name,
                  attrs: { language },
                  content: [
                    {
                      type: 'text',
                      text: formattedText || '$ ',
                    },
                  ],
                })
                .run();
            }

            return commands.toggleNode(this.name, 'paragraph', { language });
          },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => {
        return this.editor.commands.toggleCodeBlock();
      },
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type !== this.type) {
          return false;
        }

        const language = $from.parent.attrs.language;
        const isBash = language === 'bash' || language === 'sh';

        if (isBash) {
          const content = $from.parent.textContent;
          
          if (!content.trim()) {
            return editor.commands.insertContent('$ ');
          }
          
          return editor.commands.insertContent('\n$ ');
        }

        return false;
      },

      'Shift-Enter': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type !== this.type) {
          return false;
        }

        const language = $from.parent.attrs.language;
        const isBash = language === 'bash' || language === 'sh';
        
        if (isBash) {
          const content = $from.parent.textContent;
          if (!content.trim()) {
            return editor.commands.insertContent('$ ');
          }
        }

        return editor.commands.insertContent('\n');
      },
      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { empty, $anchor } = selection;

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false;
        }

        const textContent = $anchor.parent.textContent;
        const trimmedContent = textContent.trim();
        const language = $anchor.parent.attrs.language;
        const isBash = language === 'bash' || language === 'sh';

        const isEmpty = isBash 
          ? (trimmedContent === '' || trimmedContent === '$' || trimmedContent === '$ ')
          : trimmedContent.length === 0;

        if (isEmpty) {
          const pos = $anchor.before();
          const nodeSize = $anchor.parent.nodeSize;
          
          if (pos === 0) {
            return this.editor
              .chain()
              .command(({ tr }) => {
                const paragraph = state.schema.nodes.paragraph.create();
                tr.replaceWith(0, nodeSize, paragraph);
                return true;
              })
              .focus(1)
              .run();
          } else {
            return this.editor.commands.deleteNode(this.name);
          }
        }

        if ($anchor.parentOffset === 0) {
          return false;
        }

        return false;
      },
      Delete: () => {
        const { empty, $anchor } = this.editor.state.selection;

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false;
        }

        const textContent = $anchor.parent.textContent.trim();

        if (textContent.length === 0) {
          return this.editor.commands.clearNodes();
        }

        return false;
      },
      'Mod-Enter': () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const after = $from.after();

        return this.editor
          .chain()
          .command(({ tr }) => {
            const paragraph = state.schema.nodes.paragraph.create();
            tr.insert(after, paragraph);
            return true;
          })
          .focus(after + 1)
          .run();
      },

      Tab: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type !== this.type) {
          return false;
        }

        return this.editor.commands.insertContent('  ');
      },
    };
  },
});