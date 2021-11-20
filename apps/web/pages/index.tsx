import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { gql, useMutation } from '@apollo/client';
import xlsx from 'xlsx';
import { signOut, useSession } from 'next-auth/client';
import { ToastContainer, toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

export default function Index() {
  const [session, loading] = useSession();
  const notify = () => toast('Hello World');
  return (<div>
    <Head>
      <title>Home</title>
    </Head>
    <h1 onClick={notify} className="cursor-pointer mb-2">Welcome 🦄</h1>
    <ToastContainer/>
    {!loading && session && <Link href="/programs"><h4 className="underline cursor-pointer"> Go to Programs page </h4></Link>}
    <p>A Capstone project about tracking learning outcome of each and all students in your course.</p>
    <div className="my-3"></div>
    {!loading && !session && <Link href="/login">Login</Link>}
    {!loading && session && <p className="cursor-pointer" onClick={() => signOut()}>Logout</p>}
    
  </div>);
};

interface StudentExcel {
  id: string;
  email: string;
  name: string;
  surname: string;
}
