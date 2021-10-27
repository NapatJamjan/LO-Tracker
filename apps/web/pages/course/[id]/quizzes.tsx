import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { CourseStaticPaths } from '../../../utils/staticpaths';
import { ParsedUrlQuery } from 'querystring';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export default function Index({courseID}: {courseID: string}) {
  return (<div>
    <Head>
      <title>Manage quizzes</title>
    </Head>
    <p>Hello</p>
  </div>);
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{courseID: string}> = async (context) => {
  const { id: courseID } = context.params as Params;
  return {
    props: {
      courseID
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths = CourseStaticPaths;
