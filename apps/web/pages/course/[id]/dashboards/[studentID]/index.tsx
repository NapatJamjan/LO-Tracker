import { gql, useQuery } from '@apollo/client';
import ProgramAnchor from 'apps/web/components/ProgramAnchor';
import { useStudent } from 'apps/web/utils/dashboard-helper';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ClientOnly from '../../../../../components/ClientOnly';
import { IndividualPLO, IndividualQuiz, InfoPage } from '../../../../../components/dashboards/stdtable';

// path => /course/[id]/dashboards/[studentID]
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly>
      <IndexPage/>
    </ClientOnly>
  </div>);
};
interface student {
  id: string;
  email: string;
  fullname: string;
}
function IndexPage() {
  const router = useRouter();
  const courseID = router.query.id as string; // extract id from router.query and rename to courseID, but not rename studentID
  const studentID = router.query.studentID as string; 
  const [state, setState] = useState("Quiz");
  const [students, loaded] = useStudent(courseID);
  const [student, setStudent] = useState<student>({id: "00000", fullname: "Loading", email:"Loading"})
  useEffect(() => {
    if(students.length > 0){
      setStudent(students.find(e => e.id == studentID))
    }
  }, [students])
  
  return <div>
    <NavHistory courseID={courseID} studentID={studentID}/>
    <MainDiv>
      <BackButton onClick={() => router.push(`/course/${courseID}/dashboards`)}>
        &#12296;Back
      </BackButton>
      <h4 style={{position: "absolute", left: 0, right: 0, textAlign: "center"}}>Individual Summary</h4>
      <h6>Student ID: {student.id}</h6>
      <h6>Name: {student.fullname}</h6>
      <DashboardDiv>
        <ButtonTab>
          <button onClick={() => setState("Quiz")} style={{ marginRight: 5 }}
          className="border border-blue-500 rounded-md border-2">
            {state === "Quiz" && <b>Quiz Score</b> || <span>Quiz Score</span>}
          </button>
          <button onClick={() => setState("Outcome")} style={{ marginRight: 5 }}
          className="border border-blue-500 rounded-md border-2">
             {state === "Outcome" && <b>Outcome Score</b> || <span>Outcome Score</span>}
          </button>
          {/* <button onClick={() => setState("Info")}
          className="border border-blue-500 rounded-md border-2">
            {state === "Info" && <b>Information</b> || <span>Information</span>}
          </button> */}
        </ButtonTab>
        {state === "Quiz" && <IndividualQuiz studentID={studentID}/>}
        {state === "Outcome" && <IndividualPLO studentID={studentID}/>}
        {/* {state === "Info" && <InfoPage studentID={studentID}/>} */}
      </DashboardDiv>
    </MainDiv>
    
  </div>;
};

// supply
interface CourseModel {
  id: string;
  name: string;
  programID: string;
}
function NavHistory({courseID, studentID}: {courseID: string, studentID: string}) {
  const {data, loading} = useQuery<{course: CourseModel}, {courseID: string}>(gql`
    query Course($courseID: ID!) {
      course(courseID: $courseID) {
        id
        name
        programID
    }}
  `, {variables: {courseID}});
  if (loading) return <p></p>;
  return (<p>
    <Link href="/">Home</Link>
    {' '}&#12297;{' '}
    <Link href="/programs">Programs</Link>
    {' '}&#12297;{' '}
    <ProgramAnchor programID={data.course.programID} href={`/program/${data.course.programID}/courses`}/>
    {' '}&#12297;{' '}
    <Link href={`/course/${data.course.id}`}>{data.course.name}</Link>
    {' '}&#12297;{' '}
    <Link href={`/course/${data.course.id}/dashboards`}>Dashboard</Link>
    {' '}&#12297;{' '}
    <span>{studentID}</span>
  </p>);
}

const MainDiv = styled.div`
  margin: 1.5%;
  text-align: start;
`;

const BackButton = styled.button`
  float: left;
  margin-top: 20px;
  padding: 5px;
  margin-right: 15px;
`;

const DashboardDiv = styled.div`
    text-align: left;
    margin-left : 1%;
    margin-right: 1%;
`;
  
const ButtonTab = styled.div`
    display: inline-block;
`;