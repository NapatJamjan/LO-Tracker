import { useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import router from 'next/router';
import { ToastContainer, toast } from 'react-toastify';

interface UserLoginForm {
  username: string;
  password: string;
}

export default function Page() {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { register, handleSubmit } = useForm<UserLoginForm>();
  const {data: session, status} = useSession();
  if (status === 'loading' || session) {
    return null;
  }
  const submitForm = (form: UserLoginForm) => {
    if (form.username === '') {
      toast('Please complete the form', { type: 'info' });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    signIn("credentials", {
      redirect: false,
      ...form
    }).then(res => {
      if (res.error) throw res.error;
      router.replace('/programs');
    }).catch(_ => toast(`Error: User not found`, { type: 'error' })).finally(() => setSubmitting(false));
  }
  return <div className="flex justify-center" style={{paddingTop: '30vh'}}>
    <ToastContainer/>
    <form onSubmit={handleSubmit(submitForm)} className="flex flex-column items-center gap-y-4">
      <div>
        <span>Username</span><br/>
        <input {...register('username', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
      </div>
      <div>
        <span>Password</span><br/>
        <input type="password" {...register('password', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
      </div>
      <input type="submit" value="sign in" className={`py-1 px-3 bg-gray-900 hover:bg-gray-600 text-white rounded-lg ${submitting?'disabled:opacity-50':''}`}/>
    </form>
  </div>;
}
