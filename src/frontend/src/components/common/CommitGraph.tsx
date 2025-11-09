import { Dot, GitCommitHorizontal, Minus, Plus } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import CommitGraphSvg from './svgs/CommitGraphSvg'
import { useGitEngine } from '@/lib/react-query/hooks/use-git-engine';
import { useQueryClient } from '@tanstack/react-query';
import { terminalKeys } from '@/lib/react-query/query-keys';
import CommitDetailsDialog from './CommitDetailsDialog';
import { ICommit, IRepositoryState, GitCommandResponse } from '@/types/git';

interface CommitGraphProps {
    dataSource?: 'practice' | 'goal';
    customResponses?: GitCommandResponse[];
    goalRepositoryState?: IRepositoryState;
    showClearButton?: boolean;
    title?: string;
    className?: string;
    practiceId?: string;
    practiceVersion?: number;
    isResetting?: boolean;
    initialZoom?: number;
}

function CommitGraph({ 
    dataSource = 'practice',
    customResponses,
    goalRepositoryState,
    showClearButton = true,
    title = 'Commit Graph',
    className = '',
    practiceId,
    practiceVersion,
    isResetting = false,
    initialZoom = 1
}: CommitGraphProps) {
    const t = useTranslations('commitGraph.ui')
    const [containerSize, setContainerSize] = useState({ width: 1504, height: 400 });
    const [zoom, setZoom] = useState(initialZoom);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
    const [hasCommits, setHasCommits] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [showCommitDetailsDialog, setShowCommitDetailsDialog] = useState(false);
    const [selectedCommit, setSelectedCommit] = useState<ICommit | null>(null);
    
    const { clearAllData } = useGitEngine(practiceId);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (dataSource === 'goal') {
            if (goalRepositoryState) {
                const mockResponses = [
                    {
                        repositoryState: goalRepositoryState,
                        command: 'git status',
                        success: true,
                        output: 'Repository state loaded for goal visualization'
                    }
                ];

                queryClient.setQueryData(terminalKeys.goal, mockResponses);
            } else {
                queryClient.setQueryData(terminalKeys.goal, []);
            }

            return () => {
                queryClient.setQueryData(terminalKeys.goal, []);
            };
        }
    }, [goalRepositoryState, queryClient, dataSource]);

    const handleResetView = useCallback((targetPanX?: number, targetPanY?: number) => {
        setZoom(initialZoom);
        if (targetPanX !== undefined && targetPanY !== undefined) {
            setPan({ x: targetPanX, y: targetPanY });
        } else {
            setPan({ x: 0, y: 0 });
        }
    }, [initialZoom]);

    const handleCommitsChange = useCallback((hasCommits: boolean) => {
        setHasCommits(hasCommits);
    }, []);

    const handleCommitDoubleClick = useCallback((commit: ICommit) => {
        setSelectedCommit(commit);
        setShowCommitDetailsDialog(true);
    }, []);

    const handleCloseCommitDetails = useCallback(() => {
        setShowCommitDetailsDialog(false);
        setSelectedCommit(null);
    }, []);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight })
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);

    }, [containerRef])

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!hasCommits) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, zoom * delta));

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const pointerOffsetX = mouseX - pan.x;
        const pointerOffsetY = mouseY - pan.y;

        setPan({
            x: mouseX - pointerOffsetX * (newZoom / zoom),
            y: mouseY - pointerOffsetY * (newZoom / zoom)
        });

        setZoom(newZoom);
    }, [zoom, pan, hasCommits]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !hasCommits) return;

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel, hasCommits]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!hasCommits) return;

        if (e.button === 0) {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
            setPointerOffset({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    }, [pan, hasCommits]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            setPan({
                x: e.clientX - pointerOffset.x,
                y: e.clientY - pointerOffset.y,
            });
        }
    }, [isDragging, pointerOffset]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleReset = useCallback(() => {
        const key = dataSource === 'goal' ? 'resetGoalCommitGraphView' : 'resetCommitGraphView';
        const resetFunction = (window as unknown as { [key: string]: (() => void) | undefined })[key];
        if (resetFunction) {
            resetFunction();
        } else {
            setZoom(initialZoom);
            setPan({ x: 0, y: 0 });
        }
    }, [dataSource, initialZoom]);

    const handlePlus = () => {
        if (!containerRef.current) return;

        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;

        setZoom(prevZoom => {
            const newZoom = Math.min(prevZoom * 1.1, 3);

            setPan(prevPan => ({
                x: centerX - (centerX - prevPan.x) * (newZoom / prevZoom),
                y: centerY - (centerY - prevPan.y) * (newZoom / prevZoom)
            }));

            return newZoom;
        });
    };

    const handleMinus = () => {
        if (!containerRef.current) return;

        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;

        setZoom(prevZoom => {
            const newZoom = Math.max(prevZoom * 0.9, 0.1);

            setPan(prevPan => ({
                x: centerX - (centerX - prevPan.x) * (newZoom / prevZoom),
                y: centerY - (centerY - prevPan.y) * (newZoom / prevZoom)
            }));

            return newZoom;
        });
    };

    return (
        <div className={`rounded-lg shadow-sm border border-[var(--border)] overflow-hidden bg-terminal-bg ${className}`}>
            <div className="px-4 py-3 border-b border-[var(--border)] bg-terminal-header ">
                <div className="flex items-start md:items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-foreground min-w-0">
                        <GitCommitHorizontal />
                        <h1 className="font-bold text-lg sm:text-xl truncate">{t('title')}</h1>
                    </span>
                </div>
                <ul className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-[13px] text-muted-foreground">
                    <li>{t('hintZoom')}</li>
                    <li className="hidden sm:block"><Dot /></li>
                    <li>{t('hintPan')}</li>
                    <li className="hidden sm:block"><Dot /></li>
                    <li>{t('hintDrag')}</li>
                    <li className="hidden sm:block"><Dot /></li>
                    <li>{t('hintPersist')}</li>
                </ul>
            </div>
            <div className="p-4">
                <div ref={containerRef} className={`min-h-[400px] border border-[var(--border)] rounded-lg relative bg-graph-canvas shadow-inner ${hasCommits ? 'cursor-grab' : 'cursor-default'}`} aria-disabled={!hasCommits}>
                    {}
                    <ul className="absolute z-10 flex items-center text-[12px] border px-2 rounded-sm border-[var(--border)] bg-background/85 backdrop-blur-sm top-2 left-2 text-muted-foreground ">
                        {hasCommits ? (
                          <>
                            <li>{t('hintZoom')}</li>
                            <li><Dot /></li>
                            <li>{t('hintPan')}</li>
                          </>
                        ) : (
                          <li>{t('hintDisabled')}</li>
                        )}
                    </ul>
                    {}
                    <div className="absolute z-10 flex items-center top-2 right-2 gap-2">
                        <button className="bg-background border border-[var(--border)] rounded-sm cursor-pointer p-1 text-muted-foreground text-sm hover:bg-muted" onClick={handleMinus} aria-label={t('zoomOut')} title={t('zoomOut')}><Minus size={16} /></button>
                        <button className="bg-background border border-[var(--border)] rounded-sm cursor-pointer p-1 text-muted-foreground text-sm hover:bg-muted" onClick={handlePlus} aria-label={t('zoomIn')} title={t('zoomIn')}><Plus size={16} /></button>
                        <button className="bg-background border border-[var(--border)] rounded-sm cursor-pointer p-1 text-muted-foreground text-sm hover:bg-muted" onClick={handleReset} title={t('resetView')}>{t('reset')}</button>
                        <input disabled className="bg-background border border-[var(--border)] rounded-sm p-1 text-muted-foreground text-sm outline-none max-w-12" value={`${Math.floor(zoom * 100)}%`} />
                    </div>
                    {}
                    <CommitGraphSvg 
                        width={containerSize.width} 
                        height={containerSize.height} 
                        pan={pan} 
                        zoom={zoom}
                        practiceId={practiceId}
                        practiceVersion={practiceVersion}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onResetView={handleResetView}
                        onCommitsChange={handleCommitsChange}
                        onCommitDoubleClick={handleCommitDoubleClick}
                        dataSource={dataSource}
                        customResponses={customResponses}
                        isResetting={isResetting}
                        initialZoom={initialZoom}
                    />
                </div>
            </div>
            
            
            {}
            <CommitDetailsDialog
                open={showCommitDetailsDialog}
                commit={selectedCommit}
                onClose={handleCloseCommitDetails}
            />
            
        </div>
    )
}

export default CommitGraph