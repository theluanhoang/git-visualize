import { Palette } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';

const COLORS = [
    { name: 'Default', value: '' },
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#374151' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Lime', value: '#84CC16' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Fuchsia', value: '#D946EF' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Rose', value: '#F43F5E' },
];

function TextColorPicker({ editor }: { editor: Editor }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleColorSelect = (color: string) => {
        if (color === '') {
            editor.chain().focus().setMark('textStyle', { color: null }).run();
        } else {
            editor.chain().focus().setMark('textStyle', { color }).run();
        }
        setIsOpen(false);
    };

    const currentColor = editor.getAttributes('textStyle').color || '';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded hover:bg-gray-100 relative ${
                    currentColor ? 'bg-gray-50' : ''
                }`}
                title="Text Color"
            >
                <Palette
                    className="w-5 h-5 text-[color:var(--foreground)]"
                    style={{ color: currentColor || 'var(--foreground)' }}
                />
                {currentColor && (
                    <div
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded"
                        style={{ backgroundColor: currentColor }}
                    />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-48">
                    <div className="grid grid-cols-5 gap-1">
                        {COLORS.map((color) => (
                            <Button
                                key={color.value}
                                onClick={() => handleColorSelect(color.value)}
                                className={`w-8 h-8 p-0 rounded border-2 hover:scale-110 transition-transform ${
                                    currentColor === color.value
                                        ? 'border-blue-500'
                                        : 'border-gray-300'
                                }`}
                                style={{
                                    backgroundColor: color.value || '#ffffff',
                                    backgroundImage: color.value === '' 
                                        ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)'
                                        : 'none',
                                    backgroundSize: color.value === '' ? '6px 6px' : 'auto',
                                    backgroundPosition: color.value === '' ? '0 0, 3px 3px' : 'auto',
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TextColorPicker;