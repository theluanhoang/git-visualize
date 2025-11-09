import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'

function TextAlignSelection({ editor }: { editor: Editor | null }) {
    const [selectedAlign, setSelectedAlign] = useState('left')

    useEffect(() => {
        if (!editor) return

        const updateAlignment = () => {
            if (editor.isActive({ textAlign: 'left' })) {
                setSelectedAlign('left')
            } else if (editor.isActive({ textAlign: 'center' })) {
                setSelectedAlign('center')
            } else if (editor.isActive({ textAlign: 'right' })) {
                setSelectedAlign('right')
            } else if (editor.isActive({ textAlign: 'justify' })) {
                setSelectedAlign('justify')
            } else {
                setSelectedAlign('left')
            }
        }

        editor.on('selectionUpdate', updateAlignment)
        editor.on('update', updateAlignment)
        updateAlignment()

        return () => {
            editor.off('selectionUpdate', updateAlignment)
            editor.off('update', updateAlignment)
        }
    }, [editor])

    if (!editor) return null
    
    const alignments = [
        { value: 'left', label: 'Align Left', icon: AlignLeft },
        { value: 'center', label: 'Align Center', icon: AlignCenter },
        { value: 'right', label: 'Align Right', icon: AlignRight },
        { value: 'justify', label: 'Justify', icon: AlignJustify },
    ]

    const SelectedIcon = alignments.find(a => a.value === selectedAlign)?.icon || AlignLeft

    const handleAlignChange = (value: string) => {
        setSelectedAlign(value)
        editor.chain().focus().setTextAlign(value).run()
    }

    return (
        <Select value={selectedAlign} onValueChange={handleAlignChange}>
            <SelectTrigger className="">
                <SelectedIcon className="h-5 w-5" />
            </SelectTrigger>
            <SelectContent>
                {alignments.map((alignment) => {
                    const Icon = alignment.icon
                    return (
                        <SelectItem 
                            key={alignment.value} 
                            value={alignment.value}
                            className="cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="text-sm">{alignment.label}</span>
                            </div>
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}

export default TextAlignSelection