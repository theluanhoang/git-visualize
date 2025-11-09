import { List, ListOrdered, ListTodo } from 'lucide-react';
import { Editor, useEditorState } from '@tiptap/react';
import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const ListButtons = memo(({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    const toggleBulletList = useCallback(() => {
        editor.chain().focus().toggleBulletList().run();
    }, [editor]);

    const toggleOrderedList = useCallback(() => {
        editor.chain().focus().toggleOrderedList().run();
    }, [editor]);

    const toggleTaskList = useCallback(() => {
        editor.chain().focus().toggleTaskList().run();
    }, [editor]);

    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            if (!ctx.editor) return {
                isBulletList: false,
                isOrderedList: false,
                isTaskList: false
            };
            return {
                isBulletList: ctx.editor.isActive('bulletList'),
                isOrderedList: ctx.editor.isActive('orderedList'),
                isTaskList: ctx.editor.isActive('taskList'),
            };
        },
    });

    const isBulletListActive = editorState?.isBulletList || false;
    const isOrderedListActive = editorState?.isOrderedList || false;
    const isTaskListActive = editorState?.isTaskList || false;

    return (
        <div className="flex gap-1 items-center">
            <Button
                type="button"
                size="sm"
                variant={isBulletListActive ? 'secondary' : 'ghost'}
                onClick={toggleBulletList}
                className={`h-8 w-8 p-0 ${isBulletListActive ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                size="sm"
                variant={isOrderedListActive ? 'secondary' : 'ghost'}
                onClick={toggleOrderedList}
                className={`h-8 w-8 p-0 ${isOrderedListActive ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                size="sm"
                variant={isTaskListActive ? 'secondary' : 'ghost'}
                onClick={toggleTaskList}
                className={`h-8 w-8 p-0 ${isTaskListActive ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
                title="Task List"
            >
                <ListTodo className="h-4 w-4" />
            </Button>
        </div>
    );
});

ListButtons.displayName = 'ListButtons';

export default ListButtons;