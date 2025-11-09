'use client'

import React from 'react'

type Props = {
  src?: string
  darkSrc?: string
  blur?: boolean
}

export default function CodeImageBackground({ src, darkSrc, blur = true }: Props) {
  const lightUrl = src ?? 'https://user-images.githubusercontent.com/3369400/133268513-5bfe2f93-4402-42c9-a403-81c9e86934b6.jpeg'
  const darkUrl = darkSrc ?? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className={`absolute inset-0 bg-center bg-cover ${blur ? 'blur-[1px] md:blur-[2px]' : ''}`}
        style={{ backgroundImage: `url(${lightUrl})` }}
      />
      <div
        className={`absolute inset-0 bg-center bg-cover hidden dark:block ${blur ? 'blur-[1px] md:blur-[2px]' : ''}`}
        style={{ backgroundImage: `url(${darkUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
    </div>
  )
}



