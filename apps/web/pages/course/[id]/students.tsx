import Head from 'next/head';
import Link from 'next/link';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { CourseStaticPaths } from '../../../utils/staticpaths';
import { ParsedUrlQuery } from 'querystring';
import ProgramAnchor from '../../../components/ProgramAnchor';
import ClientOnly from '../../../components/ClientOnly';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
  programID: string;
};

interface StudentModel {
  id: string;
  email: string;
  name: string;
  surname: string;
};

export default function Index({course, students}: {course: CourseModel, students: StudentModel[]}) {
  return (<div>
    <Head>
      <title>Students in the course</title>
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
      <span>Students</span>
    </p>
    <table className="table-auto mt-4">
      <thead>
        <tr className="bg-gray-100">
          <td className="text-center">Student ID</td>
          <td>Student Email</td>
          <td>Student Name</td>
          <td>Student Surname</td>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 && <tr><td className="text-center">---</td><td>No Data</td><td>---</td><td>---</td></tr>}
        {
          [...students].sort((s1, s2) => s1.id.localeCompare(s2.id)).map((student) => (
            <tr key={student.id}>
              <td className="text-center">{student.id}</td>
              <td>{student.email}</td>
              <td>{student.name}</td>
              <td>{student.surname}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>);
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{course: CourseModel, students: StudentModel[]}> = async (context) => {
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
  const {data: {course}} = await client.query<{course: CourseModel}, {courseID: string}>({
    query: GET_COURSE,
    variables: {
      courseID
    }
  });
  const GET_STUDENTS_IN_COURSE = gql`
    query StudentsInCourse($courseID: ID!) {
      studentsInCourse(courseID: $courseID) {
        id
        email
        name
        surname
      }
    }
  `;
  const {data: {studentsInCourse}} = await client.query<{studentsInCourse: StudentModel[]}, {courseID: string}>({
    query: GET_STUDENTS_IN_COURSE,
    variables: {courseID}
  });
  return {
    props: {
      course,
      students: studentsInCourse
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths = CourseStaticPaths;
