import { Mark, mergeAttributes } from '@tiptap/core'

export interface HighlightOptions {
  multicolor: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (attributes?: { color: string }) => ReturnType
      toggleHighlight: (attributes?: { color: string }) => ReturnType
      unsetHighlight: () => ReturnType
    }
  }
}

export const CustomHighlight = Mark.create<HighlightOptions>({
  name: 'highlight',

  addOptions() {
    return {
      multicolor: true,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      color: {
        default: '#fef08a',
        parseHTML: element => element.getAttribute('data-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }
          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}; padding: 0.125rem 0.25rem; border-radius: 0.25rem;`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      },
      {
        tag: 'span[data-color]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHighlight: (attributes) => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      toggleHighlight: (attributes) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
      unsetHighlight: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-h': () => this.editor.commands.toggleHighlight({ color: '#fef08a' }),
    }
  },
})