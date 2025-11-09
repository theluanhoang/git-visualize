import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { ALargeSmall } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'

function FontSizeSelection({ editor }: { editor: Editor | null }) {
    const [selectedValue, setSelectedValue] = useState('default')
    
    const fontSizes = [
        { value: 'default', label: 'Default' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
        { value: '14', label: '14' },
        { value: '16', label: '16' },
        { value: '18', label: '18' },
        { value: '24', label: '24' },
        { value: '30', label: '30' },
        { value: '36', label: '36' },
        { value: '48', label: '48' },
        { value: '60', label: '60' },
        { value: '72', label: '72' },
        { value: '96', label: '96' },
    ]

    useEffect(() => {
        if (!editor) return

        const updateCurrentSize = () => {
            const fontSize = editor.getAttributes('textStyle').fontSize
            
            if (!fontSize) {
                setSelectedValue('default')
                return
            }

            const sizeValue = fontSize.toString().replace('px', '')
            
            const matchedSize = fontSizes.find(s => s.value === sizeValue)
            
            if (matchedSize) {
                setSelectedValue(matchedSize.value)
            } else {
                setSelectedValue('default')
            }
        }

        editor.on('selectionUpdate', updateCurrentSize)
        editor.on('update', updateCurrentSize)
        updateCurrentSize()

        return () => {
            editor.off('selectionUpdate', updateCurrentSize)
            editor.off('update', updateCurrentSize)
        }
    }, [editor])

    if (!editor) return null

    const handleSizeChange = (value: string) => {
        setSelectedValue(value)

        if (value === 'default') {
            editor.chain().focus().unsetFontSize().run()
        } else {
            editor.chain().focus().setFontSize(value).run()
        }
    }

    return (
        <Select value={selectedValue} onValueChange={handleSizeChange}>
            <SelectTrigger className="w-[70px] gap-1">
                {selectedValue === 'default' ? (
                    <ALargeSmall className="h-5 w-5" />
                ) : (
                    <span className="text-sm font-medium">{selectedValue}</span>
                )}
            </SelectTrigger>
            <SelectContent>
                {fontSizes.map((size) => (
                    <SelectItem 
                        key={size.value} 
                        value={size.value}
                        className="text-sm"
                    >
                        {size.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default FontSizeSelection