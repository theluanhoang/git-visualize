import { Subscript, Superscript } from 'lucide-react'
import { Editor } from '@tiptap/react'
import React from 'react'
import { Button } from '@/components/ui/button'

function SubSupButtons({ editor }: { editor: Editor | null }) {
    if (!editor) return null

    const isSubscriptActive = editor.isActive('subscript')
    const isSuperscriptActive = editor.isActive('superscript')

    return (
        <div className="flex gap-1 items-center">
            <Button
                type="button"
                size="sm"
                variant={isSubscriptActive ? 'secondary' : 'ghost'}
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={`h-8 w-8 p-0 ${isSubscriptActive ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
                title="Subscript"
            >
                <Subscript className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant={isSuperscriptActive ? 'secondary' : 'ghost'}
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={`h-8 w-8 p-0 ${isSuperscriptActive ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
                title="Superscript"
            >
                <Superscript className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default SubSupButtons