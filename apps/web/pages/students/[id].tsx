import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import { gql } from '@apollo/client';
import client from '../../apollo-client';

export default function Page({student}: {student: StudentModel}) {
  return <div>
    <Head>
      <title>{student.name}</title>
    </Head>
    <div>
      {student.id}<br/>
      {student.email}<br/>
      {student.name}<br/>
      {student.surname}<br/>
    </div>
  </div>;
}

interface PageParams extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{student: StudentModel}> = async (context) => {
  const { id: studentID } = context.params as PageParams;
  const { data } = await client.query<{student: StudentModel}, {studentID: string}>({
    query: GET_STUDENT, variables: { studentID }
  });
  return {
    props: {
      student: data.student
    },
    revalidate: 30,
  };
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  const { data } = await client.query<{students: StudentModel[]}>({
    query: GET_STUDENTS
  });
  return {
    paths: data.students.map((student) => ({
      params: {id: student.id}
    })),
    fallback: 'blocking',
  };
};

interface StudentModel {
  id: string;
  email: string;
  name: string;
  surname: string;
};

const GET_STUDENT = gql`
  query Student($studentID: ID!) {
    student(studentID: $studentID) {
      id
      email
      name
      surname
}}`;

const GET_STUDENTS = gql`
  query Students {
    students {
      id
}}`;
