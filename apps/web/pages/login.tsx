import { signIn } from 'next-auth/client';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/client';
import { useState, useEffect } from 'react';
import router from 'next/router';

export default function Page() {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { register, handleSubmit } = useForm<{username: string, password: string}>();
  const [session, loading] = useSession();
  useEffect(() => {
    if (!loading && session) router.replace('/programs');
  }, [loading]);
  if (loading || session) {
    return null;
  }
  return <form onSubmit={handleSubmit((form) => {
      if (submitting) return;
      setSubmitting(true);
      signIn("credentials", form).finally(() => setSubmitting(false));
    })}>
    <span>Username</span>
    <br />
    <input {...register('username', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
    <span>Password</span>
    <br />
    <input type="password" {...register('username', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
    <input type="submit" value="sign in" className={`py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg ${submitting?'disabled:opacity-50':''}`}/>
  </form>;
}
