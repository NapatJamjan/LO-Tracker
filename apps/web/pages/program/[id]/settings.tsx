import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { ProgramMainMenu, ProgramSubMenu } from '../../../components/Menu';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export default ({program}: {program: ProgramModel}) => {
  return <div>
    <Head>
      <title>Program Settings</title>
    </Head>
    <ProgramMainMenu programID={program.id} />
    <ProgramSubMenu programID={program.id} selected={'settings'}/>
    <p className="mt-4 mb-2 underline">Program Settings</p>
    <div className="grid grid-cols-2 gap-4">
      <div>Program Name</div>
      <input type="text" placeholder="program's name" value={program.name} className="border-4 rounded-md p-1 text-sm"/>
      <div>Program Description</div>
      <textarea placeholder="program's description" value={program.description} cols={30} className="border-4 rounded-md p-2" rows={4}></textarea>
    </div>
    <div className="flex justify-end">
      <input type="submit" value="save" className="mt-3 py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg" onClick={() => alert('not implemented')}/>
    </div>
  </div>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<{program: ProgramModel}> = async (context) => {
  const { id: programID } = context.params as Params;
  const { data } = await client.query<{program: ProgramModel}, {programID: string}>({
    query: GET_PROGRAM,
    variables: {
      programID
    }
  });
  return {
    props: {
      program: data.program,
    },
  };
};

const GET_PROGRAM = gql`
  query Program($programID: ID!) {
    program(programID: $programID) {
      id
      name
      description
}}`;
