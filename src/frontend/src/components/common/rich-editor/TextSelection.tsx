import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react';

function TextSelection({ editor }: { editor: Editor | null}) {
    const [currentStyle, setCurrentStyle] = useState('paragraph')

    useEffect(() => {
        if (!editor) return

        const updateCurrentStyle = () => {
            if (editor.isActive('heading', { level: 1 })) {
                setCurrentStyle('heading1')
            } else if (editor.isActive('heading', { level: 2 })) {
                setCurrentStyle('heading2')
            } else if (editor.isActive('heading', { level: 3 })) {
                setCurrentStyle('heading3')
            } else if (editor.isActive('heading', { level: 4 })) {
                setCurrentStyle('heading4')
            } else if (editor.isActive('heading', { level: 5 })) {
                setCurrentStyle('heading5')
            } else if (editor.isActive('heading', { level: 6 })) {
                setCurrentStyle('heading6')
            } else {
                setCurrentStyle('paragraph')
            }
        }

        editor.on('selectionUpdate', updateCurrentStyle)
        editor.on('update', updateCurrentStyle)

        updateCurrentStyle()

        return () => {
            editor.off('selectionUpdate', updateCurrentStyle)
            editor.off('update', updateCurrentStyle)
        }
    }, [editor])

    if (!editor) return null

    const handleValueChange = (value: string) => {
        setCurrentStyle(value)

        if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run()
        } else if (value.startsWith('heading')) {
            const level = parseInt(value.replace('heading', '')) as 1 | 2 | 3 | 4 | 5 | 6
            editor.chain().focus().setHeading({ level }).run()
        }
    }

    return (
        <Select value={currentStyle} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Paragraph" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="paragraph" className="text-sm">
                    Paragraph
                </SelectItem>
                <SelectItem value="heading1" className="text-2xl font-bold">
                    Heading 1
                </SelectItem>
                <SelectItem value="heading2" className="text-xl font-bold">
                    Heading 2
                </SelectItem>
                <SelectItem value="heading3" className="text-lg font-bold">
                    Heading 3
                </SelectItem>
                <SelectItem value="heading4" className="text-base font-bold">
                    Heading 4
                </SelectItem>
                <SelectItem value="heading5" className="text-sm font-bold">
                    Heading 5
                </SelectItem>
                <SelectItem value="heading6" className="text-xs font-bold">
                    Heading 6
                </SelectItem>
            </SelectContent>
        </Select>
    )
}

export default TextSelection