import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'

function FontSelection({ editor }: { editor: Editor | null }) {
    const [currentFont, setCurrentFont] = useState('default')

    const fonts = [
        { value: 'default', label: 'Default', family: 'inherit' },
        { value: 'comic-sans', label: 'Comic Sans', family: 'Comic Sans MS, cursive' },
        { value: 'cursive', label: 'Cursive', family: 'cursive' },
        { value: 'monospace', label: 'Monospace', family: 'monospace' },
        { value: 'serif', label: 'Serif', family: 'serif' },
        { value: 'arial', label: 'Arial', family: 'Arial, sans-serif' },
        { value: 'times', label: 'Times New Roman', family: 'Times New Roman, serif' },
        { value: 'georgia', label: 'Georgia', family: 'Georgia, serif' },
        { value: 'verdana', label: 'Verdana', family: 'Verdana, sans-serif' },
    ]

    useEffect(() => {
        if (!editor) return

        const updateCurrentFont = () => {
            const fontFamily = editor.getAttributes('textStyle').fontFamily
            
            if (!fontFamily) {
                setCurrentFont('default')
                return
            }

            const matchedFont = fonts.find(f => 
                fontFamily.includes(f.family) || f.family.includes(fontFamily)
            )
            
            if (matchedFont) {
                setCurrentFont(matchedFont.value)
            } else {
                setCurrentFont('default')
            }
        }

        editor.on('selectionUpdate', updateCurrentFont)
        editor.on('update', updateCurrentFont)
        updateCurrentFont()

        return () => {
            editor.off('selectionUpdate', updateCurrentFont)
            editor.off('update', updateCurrentFont)
        }
    }, [editor])

    if (!editor) return null

    const handleFontChange = (value: string) => {
        setCurrentFont(value)

        const font = fonts.find(f => f.value === value)
        if (!font) return

        if (value === 'default') {
            editor.chain().focus().unsetFontFamily().run()
        } else {
            editor.chain().focus().setFontFamily(font.family).run()
        }
    }

    return (
        <Select value={currentFont} onValueChange={handleFontChange}>
            <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent >
                {fonts.map((font) => (
                    <SelectItem 
                        key={font.value} 
                        value={font.value}
                        style={{ fontFamily: font.family }}
                    >
                        {font.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default FontSelection