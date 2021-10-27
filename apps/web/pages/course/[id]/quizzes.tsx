import Head from 'next/head';
import Link from 'next/link';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { CourseStaticPaths } from '../../../utils/staticpaths';
import ProgramAnchor from '../../../components/ProgramAnchor';
import ClientOnly from '../../../components/ClientOnly';
import { ParsedUrlQuery } from 'querystring';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
  programID: string;
};

export default function Index({course}: {course: CourseModel}) {
  return (<div>
    <Head>
      <title>Manage quizzes</title>
    </Head>
    <p>
      <Link href="/">Home</Link>
      {' '}&#12297;{' '}
      <Link href="/programs">Programs</Link>
      {' '}&#12297;{' '}
      <ClientOnly>
        <ProgramAnchor programID={course.programID} href={`/program/${course.programID}/courses`}/>
      </ClientOnly>
      {' '}&#12297;{' '}
      <Link href={`/course/${course.id}`}>{course.name}</Link>
      {' '}&#12297;{' '}
      <span>Quizzes</span>
    </p>
    {JSON.stringify(course)}
  </div>);
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{course: CourseModel}> = async (context) => {
  const { id: courseID } = context.params as Params;
  const GET_COURSE = gql`
    query CourseDescription($courseID: ID!) {
      course(courseID: $courseID) {
        id
        name
        programID
      }
    }
  `;
  const { data } = await client.query<{course: CourseModel}, {courseID: string}>({
    query: GET_COURSE,
    variables: {
      courseID
    }
  });
  return {
    props: {
      course: data.course
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths = CourseStaticPaths;
