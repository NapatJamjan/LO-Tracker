import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';

export default function SiteLayout({children}) {
  const {data: session, status} = useSession();
  console.log(status);
  const router =  useRouter();
  useEffect(() => {
    if (router.isReady && status !== 'loading') {
      const pathname = router.pathname.replace('/', '');
      if (!session && !(pathname === 'login' || pathname === '')) {
        router.replace('/login');
      }
      if (session && !session.isTeacher && (pathname.indexOf('program') !== -1 || pathname.indexOf('course') !== -1)) {
        router.replace('/');
      }
    }
  }, [router, status]);
  return <div className="min-h-screen flex flex-col w-100">
    <nav className="flex text-white bg-black justify-around py-2">
      <Link href="/">LO Tracker</Link>
      {session && <p>You are signed in as {session.user.name}</p>}
    </nav>
    <main
      style={{
        maxWidth: 1270,
        padding: `0.5rem 1.0875rem 1.45rem`
      }}
      className="mx-auto flex-grow w-screen">
      <ToastContainer/>
      {children}
    </main>
    <footer className="mx-auto py-3">Footer</footer>
  </div>;
};