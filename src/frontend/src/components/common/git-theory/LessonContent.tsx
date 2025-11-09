"use client";

import React from "react";
import { Lesson } from "@/types/git-theory";
import Link from "next/link";
import { motion } from "framer-motion";
import CodeExample from "./CodeExample";

type Props = {
	lesson: Lesson;
};

const parseMarkdown = (text: string) => {
	return text
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/`([^`]+)`/g, (match, code) => {
			if (code.includes('git') || code.includes('sudo') || code.includes('brew') || 
				code.includes('echo') || code.includes('mkdir') || code.includes('cd') ||
				code.includes('apt') || code.includes('yum') || code.includes('pacman')) {
				
				const parts = code.split(/(\s+)/);
				const highlightedParts = parts.map((part: string, i: number) => {
					if (part.trim() === '') return part;
					
					if (part === 'git') {
						return `<span class="text-green-600 font-semibold">${part}</span>`;
					}
					
					if (part.startsWith('-') || part.startsWith('--')) {
						return `<span class="text-green-600">${part}</span>`;
					}
					
					if (part.includes('<') && part.includes('>')) {
						return `<span class="text-red-600">${part}</span>`;
					}
					
					if (part.startsWith('"') && part.endsWith('"')) {
						return `<span class="text-red-600">${part}</span>`;
					}
					
					if (part.includes('.') && !part.includes('git')) {
						return `<span class="text-blue-600">${part}</span>`;
					}
					
					return `<span class="text-gray-800">${part}</span>`;
				}).join('');
				
				return `<code class="bg-gray-50 text-gray-800 px-2 py-1 rounded-md text-sm font-mono border border-gray-200 inline-block mx-1">${highlightedParts}</code>`;
			}
			
			return `<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200">${code}</code>`;
		})
		.replace(/\n/g, '<br>');
};

export default function LessonContent({ lesson }: Props) {
	const articleRef = React.useRef<HTMLElement | null>(null);
	const [progress, setProgress] = React.useState<number>(0);

	React.useEffect(() => {
		function onScroll() {
			const el = articleRef.current;
			if (!el) return;
			const top = el.offsetTop;
			const height = el.offsetHeight;
			const scrollY = window.scrollY;
			if (scrollY <= top) {
				setProgress(0);
				return;
			}
			if (scrollY >= top + height) {
				setProgress(100);
				return;
			}
			const pct = Math.min(100, Math.max(0, ((scrollY - top) / height) * 100));
			setProgress(pct);
		}
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	React.useEffect(() => {
		const el = articleRef.current;
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
		setProgress(0);
	}, [lesson.slug]);

	const hasBashExamples = lesson.sections.some(section => 
		section.examples?.some(ex => ex.language?.toLowerCase() === 'bash' || ex.language?.toLowerCase() === 'sh')
	);

	return (
		<article ref={articleRef} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" aria-labelledby="lesson-title">
			<div className="h-1 bg-gray-100">
				<div className="h-full bg-[var(--primary)] transition-[width]" style={{ width: `${progress}%` }} aria-hidden="true" />
			</div>
			<div className="p-6">
				<header>
					<h1 id="lesson-title" className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
					<p className="text-gray-700 mt-1 leading-relaxed">{lesson.description}</p>
				</header>
			</div>
			<div className="px-6 pb-6 space-y-8">
				{lesson.sections.map((section, index) => (
					<section key={section.heading} aria-labelledby={`section-${index}-title`} className="pt-2">
						<h2 id={`section-${index}-title`} className="text-xl font-semibold text-gray-900 mb-4">
							<a href={`#section-${index}-title`} className="hover:underline">{section.heading}</a>
						</h2>
						<div 
							className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
							dangerouslySetInnerHTML={{ __html: parseMarkdown(section.body) }}
						/>
						{section.imageUrl ? (
							<div className="mt-4">
								<img src={section.imageUrl} alt="" className="w-full rounded-md border border-gray-200" />
							</div>
						) : null}
						{section.examples && section.examples.length > 0 ? (
							<div className="mt-6 space-y-4">
								{section.examples.map((ex) => (
									<CodeExample key={ex.id} id={ex.id} title={ex.title} language={ex.language} code={ex.code} description={ex.description} />
								))}
							</div>
						) : null}
					</section>
				))}
				<aside className="mt-6 p-4 rounded-md bg-gray-50 border border-gray-200" aria-label="AI hints placeholder">
					<p className="text-sm text-gray-700">Coming soon: AI hints and interactive quizzes.</p>
				</aside>
			</div>

			{hasBashExamples && (
				<motion.div 
					className="px-6 pb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="bg-gradient-to-r from-[var(--primary-50)] to-[var(--primary-100)] border border-[var(--primary-200)] rounded-lg p-6">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
								<span className="text-white text-xl">🚀</span>
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">Thử ngay!</h3>
								<p className="text-gray-700 mb-4">
									Bạn đã học các lệnh Git cơ bản. Hãy chuyển sang phòng thực hành để tự mình trải nghiệm và củng cố kiến thức.
								</p>
								<Link
									href="/practice"
									className="inline-flex items-center px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-700)] transition-colors font-medium"
								>
									Vào phòng thực hành →
								</Link>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</article>
	);
}
