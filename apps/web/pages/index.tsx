import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';

export default function Index() {
  const {data: session, status} = useSession();
  const notify = () => toast('Hello World');
  return (<div>
    <Head>
      <title>Home</title>
    </Head>
    <h1 onClick={notify} className="cursor-pointer mb-2">Welcome 🦄</h1>
    <ToastContainer/>
    {status !== 'loading' && session && <Link href="/programs"><h4 className="underline cursor-pointer"> Go to Programs page </h4></Link>}
    <p>A Capstone project about tracking learning outcome of each and all students in your course.</p>
    <div className="my-3"></div>
    {status !== 'loading' && !session && <Link href="/login">Login</Link>}
    {status !== 'loading' && session && <p className="cursor-pointer" onClick={() => signOut()}>Logout</p>}
    
  </div>);
};

interface StudentExcel {
  id: string;
  email: string;
  name: string;
  surname: string;
}
