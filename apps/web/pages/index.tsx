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
    {/* <h1 onClick={notify} className="cursor-pointer mb-2">Welcome 🦄</h1>
    <ToastContainer/> */}
    {/* Full Logo contain white bg since making transparent will broke, if bg color were to change, use lite instead */}
    <div style={{ display: "inline-flex" }}>
      <img src={'kmutt1.jpg'} width={600} />
      <div style={{margin: "auto", marginLeft: 100, textAlign: "center" }}>
      <img src={'LogoFull.png'} width={250} height={150}/>
        {status !== 'loading' && session && <>
          
          <p className="text-xl">Welcome back</p><br/>
          {!!session.isTeacher && <Link href="/programs">
            <h4 className="px-4 py-2 rounded bg-blue-200 hover:bg-blue-400 cursor-pointer text-lg"> Go to programs page👩‍🏫 </h4>
          </Link>}
          {!session.isTeacher && <Link href="/me">
            <h4 className="px-4 py-2 rounded bg-blue-200 hover:bg-blue-400 cursor-pointer text-lg"> Check my dashboard‍🎓 </h4>
          </Link>}
        </>}
        <div className="my-3"></div>
        {status !== 'loading' && <>
          {!session && <div>
            
            <p className="text-xl">Welcome!</p><br/>
            <Link href="/login"><p className="px-8 py-2 rounded bg-blue-200 hover:bg-blue-400 cursor-pointer text-lg">Login</p></Link>
          </div>
          }
          {session && 
            <p className="px-2 py-2 rounded bg-red-200 hover:bg-red-300 cursor-pointer text-lg" onClick={() => signOut()}>Logout</p>
          }
        </>}
      </div>
    </div> <br/><br/>
    <p className="text-lg">LO Tracker</p>
    <p>A Capstone project about tracking learning outcome of each and all students in your course, where not only teacher or
      program chair can access, but student too, can see their own outcome score here.
    </p>
  </div>);
};

interface StudentExcel {
  id: string;
  email: string;
  name: string;
  surname: string;
}
