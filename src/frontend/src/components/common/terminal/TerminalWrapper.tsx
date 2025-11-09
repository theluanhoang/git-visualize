import React from 'react'
import Terminal from './Terminal'
import { TerminalIcon } from 'lucide-react'

function TerminalWrapper() {
    return (
        <div className="rounded-lg shadow-sm border border-[var(--border)] bg-[var(--surface)]">
            {}
            <div className="p-4">
                <Terminal />
            </div>
        </div>
    )
}

export default TerminalWrapper