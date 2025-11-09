"use client";

import React from "react";
import { useGitEngine } from "@/lib/react-query/hooks/use-git-engine";
import { IRepositoryState } from "@/types/git";

function ActionButton({ label, onClick, variant = "primary" }: { label: string; onClick: () => void; variant?: "primary" | "outline" }) {
	return (
		<button
			onClick={onClick}
			className={
				variant === "primary"
					? "px-2.5 py-1 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] text-xs hover:bg-[var(--primary-700)]"
					: "px-2.5 py-1 rounded-md border border-[var(--border)] bg-background text-foreground text-xs hover:bg-muted"
			}
		>
			{label}
		</button>
	);
}

function FileItem({ name, onAdd, onReset, onRm, onRestore }: { name: string; onAdd?: () => void; onReset?: () => void; onRm?: () => void; onRestore?: () => void; }) {
	return (
		<li className="px-3 py-2 rounded-md border border-[var(--border)] bg-background text-sm text-foreground flex items-center justify-between">
			<span className="truncate mr-2">{name}</span>
			<div className="flex items-center gap-1">
				{onAdd && <ActionButton label="add" onClick={onAdd} variant="outline" />}
				{onReset && <ActionButton label="reset" onClick={onReset} variant="outline" />}
				{onRm && <ActionButton label="rm" onClick={onRm} variant="outline" />}
				{onRestore && <ActionButton label="restore" onClick={onRestore} variant="outline" />}
			</div>
		</li>
	);
}

function Column({ title, items, color, renderItem }: { title: string; items: string[]; color: string; renderItem: (name: string) => React.ReactNode }) {
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 flex-1">
			<h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
				<span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`}></span>
				{title}
			</h3>
			<ul className="space-y-2 min-h-[120px]">
				{items.length === 0 ? (
					<li className="text-sm text-muted-foreground">(empty)</li>
				) : (
					items.map((name) => (
						<div key={name}>{renderItem(name)}</div>
					))
				)}
			</ul>
		</div>
	);
}

export default function StagingAreaVisualizer() {
	const { responses = [], runCommand } = useGitEngine();

	const latestState: IRepositoryState | null = React.useMemo(() => {
		for (let i = responses.length - 1; i >= 0; i--) {
			if (responses[i].repositoryState) return responses[i].repositoryState as IRepositoryState;
		}
		return null;
	}, [responses]);

	const exec = (cmd: string) => void runCommand(cmd);

	return (
		<section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
			<header className="flex items-center justify-between gap-3 flex-wrap">
				<div>
					<h2 className="text-lg font-semibold text-foreground">Staging Area Visualizer</h2>
					<p className="text-sm text-muted-foreground">Working Directory → Staging Area → Repository</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<ActionButton label="git init" onClick={() => exec("git init")} variant="outline" />
					<ActionButton label="git status" onClick={() => exec("git status")} variant="outline" />
					<ActionButton label="git add ." onClick={() => exec("git add .")} />
					<ActionButton label="git add -A" onClick={() => exec("git add -A")} />
					<ActionButton label="git add -u" onClick={() => exec("git add -u")} />
					<ActionButton label="git add -p" onClick={() => exec("git add -p")} />
					<ActionButton label={'git commit -m "Demo"'} onClick={() => exec('git commit -m "Demo"')} />
				</div>
			</header>

			<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
				<Column
					title="Working Directory"
					items={latestState?.workingDirectory ?? []}
					color="bg-yellow-500"
					renderItem={(name) => (
						<FileItem
							name={name}
							onAdd={() => exec(`git add ${name}`)}
							onRm={() => exec(`git rm ${name}`)}
						/>
					)}
				/>

				<Column
					title="Staging Area (changes/additions)"
					items={latestState?.stagingArea ?? []}
					color="bg-orange-500"
					renderItem={(name) => (
						<FileItem
							name={name}
							onReset={() => exec(`git reset ${name}`)}
						/>
					)}
				/>

				<Column
					title="Repository (HEAD)"
					items={latestState?.repositoryFiles ?? []}
					color="bg-green-600"
					renderItem={(name) => (
						<FileItem
							name={name}
							onRm={() => exec(`git rm ${name}`)}
							onRestore={() => exec(`git restore ${name}`)}
						/>
					)}
				/>
			</div>

			{}
			<div className="mt-4">
				<h3 className="text-sm font-semibold text-gray-900">Staged deletions</h3>
				<ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
					{(latestState?.stagedDeletions ?? []).length === 0 ? (
						<li className="text-sm text-muted-foreground">(none)</li>
					) : (
						(latestState?.stagedDeletions ?? []).map(name => (
							<li key={name} className="px-3 py-2 rounded-md border border-[var(--border)] bg-red-500/10 text-sm text-foreground flex items-center justify-between">
								<span>{name}</span>
								<ActionButton label="unstage" onClick={() => exec(`git reset ${name}`)} variant="outline" />
							</li>
						))
					)}
				</ul>
			</div>

			{latestState ? (
				<p className="text-xs text-muted-foreground mt-3">HEAD: {latestState.head && latestState.head.type === 'branch' ? `${latestState.head.ref}` : '(detached)'}</p>
			) : (
				<p className="text-sm text-muted-foreground mt-3">Run &quot;git init&quot; to start the visualization.</p>
			)}
		</section>
	);
} 