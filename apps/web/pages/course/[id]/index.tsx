import Head from 'next/head';
import Link from 'next/link';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import CourseAnchor from '../../../components/CourseAnchor';
import { CourseStaticPaths } from '../../../utils/staticpaths';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export default function Index({course}: {course: CourseModel}) {
  return (<div>
    <Head>
      <title>Course Home</title>
    </Head>
    <p>
      <Link href="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <Link href="/programs">Programs</Link>
      &nbsp;&#12297;&nbsp;
      <CourseAnchor courseID={course.id} href="" />
    </p>
    <br/>
    <ul>
      <li><Link href={`/course/${course.id}/los`}>Manage LOs</Link></li>
      <li><Link href={`/course/${course.id}/students`}>Manage Students</Link></li>
      <li><Link href={`/course/${course.id}/quizzes`}>Manage Quizzes</Link></li>
      <li><Link href={`/course/${course.id}/dashboards`}>Dashboards</Link></li>
    </ul>
    <p className="mt-5">
      <span className="text-2xl">Course Description</span><br/>
      <span>{course.description}</span>
    </p>
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
        description
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
