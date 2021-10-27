import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths } from 'next';
import { ProgramStaticPaths } from '../../../utils/staticpaths';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export default function Settings() {
  return (<div>
    <Head>
      <title>Program Settings</title>
    </Head>
    <p>Hello</p>
  </div>);
};

export const getStaticPaths: GetStaticPaths = ProgramStaticPaths;
