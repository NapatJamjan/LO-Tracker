import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ProgramStaticPaths } from '../../../utils/staticpaths';
import { ParsedUrlQuery } from 'querystring';
import { ProgramMainMenu, ProgramSubMenu } from '../../../components/Menu';
import router from 'next/router';

interface StudentModel {
  id: string;
  email: string;
  name: string;
  surname: string;
};

export default function Page({programID, students}: {programID: string, students: StudentModel[]}) {
  return <div>
    <Head>
      <title>Students in the program</title>
    </Head>
    <ProgramMainMenu programID={programID} />
    <ProgramSubMenu programID={programID} selected={'dashboards'}/>
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
            <tr key={student.id} className="cursor-pointer hover:text-blue-600" onClick={() => router.push(`/students/${student.id}`)}>
              <td className="text-center pr-3">{student.id}</td>
              <td>{student.email}</td>
              <td>{student.name}</td>
              <td>{student.surname}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{programID: string, students: StudentModel[]}> = async (context) => {
  const { id: programID } = context.params as Params;
  const {data: {studentsInProgram}} = await client.query<{studentsInProgram: StudentModel[]}, {programID: string}>({
    query: GET_STUDENTS_IN_PROGRAM,
    variables: {programID}
  });
  return {
    props: {
      programID,
      students: studentsInProgram
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = ProgramStaticPaths;

const GET_STUDENTS_IN_PROGRAM = gql`
  query StudentsInProgram($programID: ID!) {
    studentsInProgram(programID: $programID) {
      id
      email
      name
      surname
}}`;