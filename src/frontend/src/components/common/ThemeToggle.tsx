'use client';

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const current = resolvedTheme || theme || 'light'

	return (
		<button
			onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
			aria-label="Toggle dark mode"
			className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] shadow-sm hover:bg-[color-mix(in_srgb,var(--surface),#000_5%)] cursor-pointer"
		>
			{current === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
		</button>
	)
} 