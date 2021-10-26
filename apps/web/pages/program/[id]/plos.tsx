import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths } from 'next';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export default function PLOs() {
  return (<div>
    <Head>
      <title>Manage PLOs</title>
    </Head>
    <p>Hello</p>
  </div>);
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  const GET_PROGRAMS = gql`
    query Programs {
      programs {
        id
        name
        description
      }
    }
  `;
  const { data } = await client.query<{programs: ProgramModel[]}>({
    query: GET_PROGRAMS
  });
  return {
    paths: data.programs.map((program) => ({
      params: {id: program.id}
    })),
    fallback: true,
  };
};
