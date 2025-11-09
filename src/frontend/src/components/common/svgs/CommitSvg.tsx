import { ICommit } from '@/types/git'
import React, { useEffect, useRef, useState } from 'react'

interface CommitSvgParams {
    x: number,
    y: number,
    isHead: boolean,
    isCurrentBranch: boolean,
    commit?: ICommit
}

function CommitSvg({ x, y, commit, isHead, isCurrentBranch }: CommitSvgParams) {
    const branchLabel = commit ? commit.branch : 'main'
    const textRef = useRef<SVGTextElement>(null)
    const [labelDims, setLabelDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

    useEffect(() => {
        if (textRef.current) {
            const bbox = textRef.current.getBBox()
            setLabelDims({ width: bbox.width, height: bbox.height })
        }
    }, [branchLabel])

    const paddingX = 12
    const paddingY = 6
    const rectWidth = labelDims.width ? labelDims.width + paddingX * 2 : 60
    const rectHeight = labelDims.height ? labelDims.height + paddingY * 2 : 20
    const rectX = x - rectWidth / 2
    const rectY = y + 40
    return (
        <g>
            {}
            <circle
                cx={x}
                cy={y}
                r="30"
                fill={isHead ? '#10b981' : isCurrentBranch ? '#3b82f6' : '#6b7280'}
                  stroke={isHead ? '#059669' : isCurrentBranch ? '#2563eb' : '#4b5563'}
                  strokeWidth="4"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200"
                  filter="url(#shadow)"
            />

            {}
            <circle
                cx={x}
                cy={y}
                r="20"
                fill="url(#commitGradient)"
                className="pointer-events-none"
            />

            {}
            <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                className="text-xs fill-white font-mono font-bold pointer-events-none"
            >
                {commit ? commit.id.substring(0, 7) : "7aj8dc"}
            </text>

            {}
            <text
                x={x}
                y={y - 50}
                textAnchor="middle"
                className="text-sm fill-gray-700 font-medium pointer-events-none"
                width="200"
            >
                {commit ? commit.message : "feat: create a commit"}
            </text>

            {}
            <rect
                x={rectX}
                y={rectY}
                width={rectWidth}
                height={rectHeight}
                rx={rectHeight / 2}
                fill={isCurrentBranch ? '#dc2626' : '#6b7280'}
                className="pointer-events-none"
            />
            <text
                x={x}
                y={rectY + rectHeight / 2}
                textAnchor="middle"
                className="text-xs fill-white font-bold pointer-events-none"
                dominantBaseline="middle"
                ref={textRef}
            >
                {branchLabel}
            </text>
        </g>
    )
}

export default CommitSvg