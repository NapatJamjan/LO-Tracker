import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths } from 'next';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export default function Index() {
  return (<div>
    <Head>
      <title>Manage quizzes</title>
    </Head>
    <p>Hello</p>
  </div>);
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  const GET_COURSES = gql`
    query Courses {
      courses {
        id
        name
        description
        semester
        year
        ploGroupID
      }
    }
  `;
  const { data } = await client.query<{courses: CourseModel[]}>({
    query: GET_COURSES,
  });
  return {
    paths: data.courses.map((course) => ({
      params: {id: course.id}
    })),
    fallback: true,
  };
};
