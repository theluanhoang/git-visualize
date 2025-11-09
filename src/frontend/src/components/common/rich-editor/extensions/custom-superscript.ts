import { Mark } from '@tiptap/core';

const CustomSuperscript = Mark.create({
    name: 'superscript',
    addOptions() {
        return {
            HTMLAttributes: {
                class: 'sup',
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'sup',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['sup', HTMLAttributes, 0];
    },
    addCommands() {
        return {
            setSuperscript: () => ({ commands }) => {
                return commands.setMark(this.name);
            },
            unsetSuperscript: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },
});

export default CustomSuperscript;