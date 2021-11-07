import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { CourseSubMenu, KnownCourseMainMenu } from '../../../components/Menu';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
  programID: string;
};

interface PLOGroupModel {
  id: string;
  name: string;
};

export default ({course, ploGroups}: {course: CourseModel, ploGroups: PLOGroupModel[]}) => {
  return <div>
    <Head>
      <title>Course Settings</title>
    </Head>
    <KnownCourseMainMenu programID={course.programID} courseID={course.id} courseName={course.name}/>
    <CourseSubMenu courseID={course.id} selected={'settings'}/>
    <p>{JSON.stringify(course, null, 2)}</p>
    <p>{JSON.stringify(ploGroups, null, 2)}</p>
  </div>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<{course: CourseModel, ploGroups: PLOGroupModel[]}> = async (context) => {
  const { id: courseID } = context.params as Params;
  const GET_COURSE = gql`
    query CourseDetail($courseID: ID!) {
      course(courseID: $courseID) {
        id
        name
        description
        semester
        year
        ploGroupID
        programID
  }}`;
  const GET_PLOGROUPS = gql`
    query PLOGroups($programID: ID!) {
      ploGroups(programID: $programID) {
        id
        name
  }}`;
  const {data: fetchCourse} = await client.query<{course: CourseModel}, {courseID: string}>({
    query: GET_COURSE,
    variables: {
      courseID
    }
  });
  const {data: fetchPLOGroups} = await client.query<{ploGroups: PLOGroupModel[]}, {programID: string}>({
    query: GET_PLOGROUPS,
    variables: {
      programID: fetchCourse.course.programID
    }
  });
  return {
    props: {
      course: fetchCourse.course,
      ploGroups: fetchPLOGroups.ploGroups
    }
  };
};
