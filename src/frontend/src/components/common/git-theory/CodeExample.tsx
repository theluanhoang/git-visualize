"use client";

import React from "react";

type Props = {
	id: string;
	title: string;
	language?: string;
	code: string;
	description?: string;
	initialOpen?: boolean;
};

export default function CodeExample({ id, title, language, code, description, initialOpen = true }: Props) {
	const [open, setOpen] = React.useState<boolean>(initialOpen);
	const [copied, setCopied] = React.useState<boolean>(false);
	const contentId = `${id}-content`;
	const copyButtonId = `${id}-copy-btn`;
	const isBash = (language ?? '').toLowerCase() === 'bash' || (language ?? '').toLowerCase() === 'sh';

	function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			setOpen((v) => !v);
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
		}
	}

	return (
		<section className="bg-white rounded-lg shadow-sm border border-gray-200" aria-labelledby={`${id}-title`}>
			<div className="flex items-center justify-between px-4 py-3">
				<div>
					<p className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
						{language ?? "code"}
					</p>
					<h4 id={`${id}-title`} className="font-semibold text-gray-900 mt-1">{title}</h4>
				</div>
				<div className="flex items-center gap-2">
					<button
						id={copyButtonId}
						title="Copy code"
						onClick={copyToClipboard}
						className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
					>
						{copied ? "Copied" : "Copy"}
					</button>
					<button
						className="px-3 py-1.5 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] text-sm hover:bg-[var(--primary-700)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
						aria-expanded={open}
						aria-controls={contentId}
						onClick={() => setOpen((v) => !v)}
						onKeyDown={handleKeyDown}
						aria-describedby={copied ? copyButtonId : undefined}
					>
						{open ? "Hide" : "Show"}
					</button>
				</div>
			</div>
			<div id={contentId} hidden={!open} className="px-4 pb-4">
				{description ? <p className="text-sm text-gray-700 mb-2">{description}</p> : null}
				{isBash ? (
					<div className="h-full w-full bg-gray-900 text-green-400 font-mono rounded-lg flex flex-col border border-gray-800">
						<div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700 rounded-t-lg">
							<div className="text-xs text-gray-300">Bash</div>
							<div className="flex space-x-1">
								<div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
								<div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
								<div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
							</div>
						</div>
						<div className="px-3 py-2 overflow-x-auto terminal-scrollbar" style={{ scrollbarWidth: 'thin' }}>
							<pre className="text-sm leading-relaxed whitespace-pre-wrap">
								<code>$ {code}</code>
							</pre>
						</div>
						<style jsx>{`
						  .terminal-scrollbar::-webkit-scrollbar { width: 8px; }
						  .terminal-scrollbar::-webkit-scrollbar-track { background: #2d3748; border-radius: 4px; }
						  .terminal-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; border: 1px solid #2d3748; }
						  .terminal-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
						  .terminal-scrollbar::-webkit-scrollbar-thumb:active { background: #a0aec0; }
						  .terminal-scrollbar::-webkit-scrollbar-corner { background: #2d3748; }
						`}</style>
					</div>
				) : (
					<div className="relative">
						<pre className="overflow-auto rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-900 leading-relaxed" aria-label={`${title} code example`}>
							<code className="font-mono whitespace-pre">{code}</code>
						</pre>
					</div>
				)}
				<p className="sr-only" role="status" aria-live="polite">{copied ? "Code copied to clipboard" : ""}</p>
			</div>
		</section>
	);
} 