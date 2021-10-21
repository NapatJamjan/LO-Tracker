import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { AuthContext } from '../contexts/auth';


const Home = () => {
  const { login } = useContext(AuthContext);
  const { register, handleSubmit } = useForm<{ userid: string, password: string }>({
    defaultValues: {
      userid: '',
      password: '',
    }
  });
  return (
    <Layout>
      <Seo title="Login" />
      <form onSubmit={handleSubmit((form) => login(form.userid, form.password))}>
        <input {...register('userid', { required: true })} placeholder="user id" className="border-4 rounded-md p-2" />
        <p className="my-3 text-xs"></p>
        <input type="password" {...register('password', { required: true })} placeholder="password" className="border-4 rounded-md p-2"></input>
        <br /><input type="submit" value="login" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg" />
      </form>
    </Layout>
  );
};

export default Home;
