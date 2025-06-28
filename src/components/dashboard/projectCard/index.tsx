"use client"
import React from 'react'
import { cn } from '../../../lib/utils'

const ProjectCard = ({ children, className }: {
    children: React.ReactNode
    className?: string
}) => {
    return (
        <div tabIndex={0} className={cn(className, "rounded-lg border bg-card text-card-foreground shadow h-48 p-[1px] gradient-project-card-bg cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1  focus-visible:ring-ring")}>
            <div className='rounded-[7px] p-4 h-full flex flex-col justify-between gradient-project-card'>
                {children}
            </div>
        </div>
    )
}

export default ProjectCard