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

export default ({programID, program}: {programID: string, program: ProgramModel}) => {
  return <div>
    <Head>
      <title>Program Settings</title>
    </Head>
    <ProgramMainMenu programID={programID} />
    <ProgramSubMenu programID={programID} selected={'settings'}/>
    {program.name}<br/>
    {program.description}
  </div>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<{programID: string, program: ProgramModel}> = async (context) => {
  const GET_PROGRAM = gql`
    query Program($programID: ID!) {
      program(programID: $programID) {
        id
        name
        description
  }}`;
  const { id: programID } = context.params as Params;
  const { data } = await client.query<{program: ProgramModel}, {programID: string}>({
    query: GET_PROGRAM,
    variables: {
      programID
    }
  });
  return {
    props: {
      programID,
      program: data.program,
    },
  };
};
