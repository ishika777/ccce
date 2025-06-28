import Dashboard from '../../../components/dashboard'
import Navbar from '../../../components/navbar'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { VirtualBoxType } from '@/frontend/src/lib/types'
import { fetchUserById } from '@/frontend/actions/user-actions'
import { toast } from 'sonner'

const DashBoardRoute = async () => {
    const user = await currentUser()
    if (!user) {
        redirect(`/`)
    }

    let dbUser;
    try {
        dbUser = await fetchUserById(user.id);
    } catch (error: any) {
        toast.error(error)
    }
    if (!dbUser) {
        redirect(`/`)
    }

    const virtualBoxList = dbUser.virtualBox as VirtualBoxType[]

    return (
        <div>
            <Navbar userData={dbUser} />
            <Dashboard userData={dbUser} virtualBoxList={virtualBoxList} />
        </div>
    )
}

export default DashBoardRoute