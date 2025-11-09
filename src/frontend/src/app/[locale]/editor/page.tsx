import RichTextEditor from '@/components/common/rich-editor/RichTextEditor'
import React from 'react'

function EditorPage() {
  return (
    <div className="container mx-auto border border-[var(--border)] p-6">
        <RichTextEditor />
    </div>
  )
}

export default EditorPage