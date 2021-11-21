import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import styled from 'styled-components';
import Head from 'next/head';
import { gql } from '@apollo/client';
import client from '../../apollo-client';
import router from 'next/router';
import { Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ChartBarPLO } from './plochart';
import { getSession, useSession } from 'next-auth/react';

export default function Page({student}: {student: StudentModel}) {
  const {data: session, status} = useSession();
  const [dataType, setType] = useState("plo");
  function handleType(e: any) { setType(e.target.value) }
  const [tableHead, setHead] = useState<string[]>(['Student ID', 'Student Name'])
  const [tableData, setData] = useState<studentResult>(
    {studentID: student.id, studentName:(student.name+" "+student.surname), scores: []}
  );
  const MockCount = 5; // change number of Mock PLO
  // tableData.scores = Array.from({length: MockCount}, () => Math.floor(Math.random() * 90 + 10))
  if(tableData.scores.length == 0){
    for (let i = 0; i < MockCount; i++) {
      tableHead.push(`PLO ${i+1}`)
      tableData.scores.push(Math.floor(Math.random() * 90 + 10))
    }
  }
  useEffect(() => {
    for (let i = 0; i < tableData.scores.length; i++) {
     tableData.scores[i] = Math.floor(Math.random() * 90 + 10);
    }
  }, [dataType])
  if (status === 'loading') return null;
  const noPermission = !session.isTeacher && String(session.id) !== student.id;
  if (noPermission) return <p className="text-center">No permission</p>;

 
  return <div>
    <Head>
      <title>{student.name}'s Dashboard</title>
    </Head>
    <div>
      <p style={{fontSize: 20}}>Program Learning Outcome Dashboard</p>
      <div>
      <BackButton onClick={() => {
        if(session.isTeacher) router.back();
        else router.replace('/');
        }}>
        &#12296;Back
      </BackButton>
      <h6>ID: {student.id}</h6>
      <h6>Email: {student.email}</h6>
      <h6>Name: {student.name} {student.surname}</h6>
      </div><br/>
      <span>Select view type: </span>
      <select value={dataType} onChange={handleType} className="border rounded-md border-2 ">
        <option value="plo">Program Learning Outcome</option>
        <option value="coruseid1">CSC209: Data Structures</option>
      </select>
      <TableScrollDiv>
        <TableScrollable striped bordered hover className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              {tableHead.map((head, i) => (<th>{head}{i > 1 && <span> (%)</span>}</th>))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tableData.studentID}</td>
              <td>{tableData.studentName}</td>
              {tableData.scores.map(scores => (
                <td>{scores}</td>
              ))}
            </tr>
          </tbody>
        </TableScrollable>
      </TableScrollDiv>
      <ChartBarPLO data={tableData} scoreType={"Program Learning Outcome"} tableHead={tableHead.slice(2)}/>
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

interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

const BackButton = styled.button`
  float: left;
  margin-top: 10px;
  padding: 5px;
  margin-right: 15px;
  font: 18px;
`;

const TableScrollDiv = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  transform: rotateX(180deg);
`
const TableScrollable = styled(Table)`
  transform: rotateX(180deg);
`
