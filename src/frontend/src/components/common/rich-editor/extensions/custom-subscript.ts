import { Mark } from '@tiptap/core';

const CustomSubscript = Mark.create({
    name: 'subscript',
    addOptions() {
        return {
            HTMLAttributes: {
                class: 'sub',
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'sub',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['sub', HTMLAttributes, 0];
    },
    addCommands() {
        return {
            setSubscript: () => ({ commands }) => {
                return commands.setMark(this.name);
            },
            unsetSubscript: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },
});

export default CustomSubscript;