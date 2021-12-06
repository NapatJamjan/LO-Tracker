import { useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ToastContainer } from 'react-toastify'
import Image from 'next/image'
import background from '../public/background.png'

export default function SiteLayout({children}) {
  const {data: session, status} = useSession()
  const router =  useRouter()
  useEffect(() => {
    if (router.isReady && status !== 'loading') {
      const pathname = router.pathname.replace('/', '')
      if (!session && !(pathname === 'login' || pathname === '')) {
        router.replace('/login')
      }
      if (session && !session.isTeacher && (pathname.indexOf('program') !== -1 || pathname.indexOf('course') !== -1)) {
        router.replace('/')
      }
    }
  }, [router, status])
  return <div className="relative min-h-screen flex flex-col w-100">
    <div className="absolute w-100 h-100" style={{zIndex: -99, filter: 'blur(2px)'}}><Image src={background} layout="fill" placeholder="blur" objectFit="cover" objectPosition="center"/></div>
    <nav className="flex text-white bg-blue-400 justify-around py-2">
      <Link href="/">LO Tracker</Link>
      {session && <p>You are signed in as {session.user.name}</p>}
    </nav>
    <main
      style={{
        maxWidth: 1270,
        padding: `0.5rem 1.0875rem 1.45rem`
      }}
      className="mx-auto flex-grow w-screen flex flex-col justify-items-center">
      <ToastContainer/>
      <div>{children}</div>
    </main>
  </div>
}