import React from 'react'

interface ConnectionSVGParams {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}

function ConnectionSvg({ fromX, fromY, toX, toY }: ConnectionSVGParams) {
    return (
        <line
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke="#6b7280"
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
            className="transition-all duration-200"
        />
    )
}

export default ConnectionSvg