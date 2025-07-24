import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavbarSearch from './search'
import NavBarUserButton from './userButton'
import { UserType } from '../../lib/types'

const Navbar = ({ userData }: { 
    userData: UserType
 }) => {
  return (
    <div className='flex items-center justify-between h-14 px-2 w-full border-b border-border'>
        <div className='flex items-center space-x-4'>
            <Link href={`/dashboard`} className='p-0 ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none rounded-sm'  >
                <Image src={"/logo.svg"} alt='logo' width={36} height={36} />
            </Link>
        </div>
        <div className='flex items-center space-x-4'>
            <NavbarSearch />
            <NavBarUserButton userData={userData} />
        </div>
    </div>
  )
}

export default Navbar