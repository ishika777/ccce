import Dashboard from '../../../components/dashboard'
import Navbar from '../../../components/navbar'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchUserById } from '@/frontend/actions/user-actions'

const DashBoardRoute = async () => {
    const user = await currentUser()
    if (!user) {
        redirect(`/`)
    }

    let dbUser;
    try {
        dbUser = await fetchUserById(user.id);
        console.log(dbUser)
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log("An unknown error occurred.");
        }
    }
    if (!dbUser) {
        redirect(`/`)
    }

    return (
        <div>
            <Navbar userData={dbUser} />
            <Dashboard userData={dbUser} virtualBoxList={dbUser.virtualBox} />
        </div>
    )
}

export default DashBoardRoute