"use client"
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'

const NavbarSearch = () => {

    const [search, setSearch] = useState("")
    const router = useRouter()

    const searchHandler = () => {
        console.log("hiiiiiiiii")
        if (search) {
            router.push(`/dashboard?q=${search}`)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if(search){
                router.push(`/dashboard?q=${search}`)
            }else{
                router.push(`/dashboard`)
            }
        }, 0)

        return () => clearTimeout(delayDebounceFn)
    }, [search])

    // 
    // 
    //    why form dint work??????????kw/
    // 
    // 
    // 

    return (
        <div className='relative h-9 w-44 flex items-center justify-start'>
            <Search className='w-4 h-4 absolute left-2 top-2 text-muted-foreground' />
            {/* <form
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        searchHandler()
                    }
                }}
                onSubmit={(e) => {
                    e.stopPropagation();
                    searchHandler()
                }}> */}
                <Input
                    placeholder='Search Projects'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='pl-8'
                />
            {/* </form> */}
        </div>
    )
}

export default NavbarSearch