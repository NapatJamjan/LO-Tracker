import axios from 'axios';
import { navigate } from 'gatsby-link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { StudentUpload } from '../table';
import Layout from '../../../../../../../components/layout';
import { Link } from 'gatsby';
import Seo from '../../../../../../../components/seo';
import { IndividualPLO, IndividualQuiz } from './stdtable';
import { ProgramNameLink, CourseNameLink } from '../../../../../../../components/namebar';
  
const IndividualScore:React.FC<{programID: string, courseID: string, studentID: string}> = ({programID, courseID, studentID}) =>{
  const [student, setStudent] = useState<StudentUpload>(
    {studentID: "000", studentName: "Loading..", studentSurname: "Loading...", studentEmail: "Loading."});
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<StudentUpload[]>('/students', { params: { programID, courseID } })
      .then((res) => res.data.find(e => e.studentID == studentID))
      .then(setStudent);
  }, []);

  const [state, setState] = useState("Quiz");
  return (<Layout>
    <Seo title="LO" />
    <p>
      <Link to="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <Link to="/programs">Programs</Link>
      &nbsp;&#12297;&nbsp;
      <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
      &nbsp;&#12297;&nbsp;
      <CourseNameLink programID={programID} courseID={courseID} to="../" />
      &nbsp;&#12297;&nbsp;
      <Link to="../">Dashboard</Link>
      &nbsp;&#12297;&nbsp;
      <span>{studentID}</span>
    </p>
    <MainDiv>
      <BackButton onClick={() => navigate(-1)}>
        &#12296;Back
      </BackButton>
      <h4 style={{position: "absolute", left: 0, right: 0, textAlign: "center"}}>Individual Summary</h4>
      <h6>Student ID: {student.studentID}</h6>
      <h6>Name : {student.studentName}</h6>
      <DashboardDiv>
        <ButtonTab>
          <button onClick={() => setState("Quiz")} style={{ marginRight: 5 }}
          className="border border-blue-500 rounded-md border-2">Quiz Score</button>
          <button onClick={() => setState("Outcome")}
          className="border border-blue-500 rounded-md border-2">Outcome Score</button>
        </ButtonTab>
        {state === "Quiz" && <IndividualQuiz programID={programID} courseID={courseID} studentID={studentID}/>}
        {state === "Outcome" && <IndividualPLO programID={programID} courseID={courseID} studentID={studentID} />}
      </DashboardDiv>
    </MainDiv>
  </Layout>)
}

export default IndividualScore;

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