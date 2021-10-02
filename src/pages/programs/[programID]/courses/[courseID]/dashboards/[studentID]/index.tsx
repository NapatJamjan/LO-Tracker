import axios from 'axios';
import { navigate } from 'gatsby-link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { quizscore, ScoreTable, PLOscore, ScoreTableIndividual, StudentUpload } from '../table';
import Layout from '../../../../../../../components/layout';
import { Link } from 'gatsby';
import Seo from '../../../../../../../components/seo';
import { ExportOutcome } from '../exportoutcome';
  
const IndividualScore:React.FC<{programID:string, courseID: string, studentID: string}> = ({programID, courseID, studentID}) =>{
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
      <Link to={`/programs/${programID}/courses`}>{programID}</Link>
      &nbsp;&#12297;&nbsp;
      <Link to="../../">{courseID}</Link>
      &nbsp;&#12297;&nbsp;
      <Link to="../">Dashboard</Link>
      &nbsp;&#12297;&nbsp;
      <span>{studentID}</span>
    </p>
    <MainDiv>
      <BackButton onClick={() => navigate(-1)}>
        <i className="fa fa-arrow-left"></i>Back
      </BackButton>
      <h4 style={{position: "absolute", left: 0, right: 0, textAlign: "center"}}>Individual Summary</h4>
      <h6>Student ID: {student.studentID}</h6>
      <h6>Name : {student.studentName}</h6>
      <DashboardDiv>
        <ButtonTab>
          <button onClick={() => setState("Quiz")} style={{ marginRight: 5 }}>Quiz Score</button>|
          <button onClick={() => setState("Outcome")}>Outcome Score</button>
          {state === "Outcome" && <ExportOutcome programID={programID} courseID={courseID} />}
        </ButtonTab>
        {state === "Quiz" && <QuizScore courseID = {courseID}/>}
        {state === "Outcome" && <OutcomeScore courseID = {courseID}/>}
      </DashboardDiv>
    </MainDiv>
  </Layout>)
}

function QuizScore(props:{courseID: string}) {
  const quizzes: Array<quizscore> = [{id: 0, score: "1/1", detail: "How to Java"},
  {id: 1, score: "2/2", detail: "Hello World"}, {id: 2, score: "2/2", detail: "Advanced Java"}]
  const QuizHead: Array<string> = ['Quiz', 'Max Score', 'Student Score']
  for (let i = 0; i < quizzes.length; i++) { //count unique quiz id
    QuizHead.push('Question' + (i + 1));
  }
  return (
    <ScoreTableIndividual courseID={props.courseID} score={quizzes} tablehead={QuizHead} dataType="quiz" />
  )
}
  
function OutcomeScore(props:{courseID: string}) {
  const PLOs: Array<PLOscore> = [{ id: 0, score: "100%", detail: "LO1 100% \n LO2 100% \n LO3 100%" },
  { id: 1, score: "80%", detail: "LO1 100% \n LO2 100% \n LO3 100%" }, { id: 2, score: "-", detail: "No score" }]
  const PLOHead: Array<string> = ['PLO', 'Max Score', 'Student Score']
  for (let i = 0; i < PLOs.length; i++) { //count unique plo id
    PLOHead.push('LO' + (i + 1));
  }
  return (
    <ScoreTableIndividual courseID={props.courseID} score={PLOs} tablehead={PLOHead} dataType="plo" />
  )
}

export default IndividualScore;

// function ExportOutcome() {
//   return (
//     <button style={{ position: "absolute", right: 50 }}>Export Outcome</button>
//   )
// }
  
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