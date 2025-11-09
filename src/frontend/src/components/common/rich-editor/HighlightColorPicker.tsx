import { Highlighter } from 'lucide-react'
import { Editor } from '@tiptap/react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function HighlightColorPicker({ editor }: { editor: Editor | null }) {
    const [open, setOpen] = useState(false)

    if (!editor) return null

    const colors = [
        { name: 'Yellow', value: '#fef08a' },
        { name: 'Green', value: '#bbf7d0' },
        { name: 'Blue', value: '#bfdbfe' },
        { name: 'Pink', value: '#fbcfe8' },
        { name: 'Purple', value: '#e9d5ff' },
        { name: 'Orange', value: '#fed7aa' },
        { name: 'Red', value: '#fecaca' },
        { name: 'Gray', value: '#e5e7eb' },
    ]

    const handleHighlight = (color: string) => {
        editor.chain().focus().setMark('highlight', { color }).run()
        setOpen(false)
    }

    const removeHighlight = () => {
        editor.chain().focus().unsetMark('highlight').run()
        setOpen(false)
    }

    const isHighlighted = editor.isActive('highlight')

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant={isHighlighted ? 'default' : 'ghost'}
                    className="h-8 w-8 p-0"
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-medium mb-2">Highlight Color</p>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleHighlight(color.value)}
                                    className="h-8 w-8 rounded border-2 border-gray-300 hover:border-gray-900 transition-colors"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {isHighlighted && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeHighlight}
                            className="w-full"
                        >
                            Remove Highlight
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default HighlightColorPicker