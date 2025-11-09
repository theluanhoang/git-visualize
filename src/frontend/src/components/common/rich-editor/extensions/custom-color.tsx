import { Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

export type ColorOptions = {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    color: {
      setColor: (color: string) => ReturnType
      unsetColor: () => ReturnType
    }
  }
}

export const CustomColor = Extension.create<ColorOptions>({
  name: 'color',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: element => element.style.color?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.color) {
                return {}
              }

              return {
                style: `color: ${attributes.color}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setColor:
        (color: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color }).run()
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run()
        },
    }
  },
})