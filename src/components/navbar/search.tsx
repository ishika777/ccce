"use client"
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'

const NavbarSearch = () => {

    const [search, setSearch] = useState("")
    const router = useRouter()

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search) {
                router.push(`/dashboard?q=${search}`)
            } else {
                router.push(`/dashboard`)
            }
        }, 0)

        return () => clearTimeout(delayDebounceFn)
    }, [search, router])


    return (
        <div className='relative h-9 w-44 flex items-center justify-start'>
            <Search className='w-4 h-4 absolute left-2 top-2 text-muted-foreground' />
            <Input
                placeholder='Search Projects'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-8'
            />
        </div>
    )
}

export default NavbarSearch