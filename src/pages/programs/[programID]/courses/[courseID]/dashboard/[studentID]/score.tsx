import axios from 'axios';
import { navigate } from 'gatsby-link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { studentResponse, programResponse, courseResponse } from '../../../../../../../shared/initialData';
import { ExportOutcome } from '../../dashboard';
import { quizscore, ScoreTable, PLOscore } from '../Table';


export const IndividualScore:React.FC<{studentID: string}> = ({studentID}) =>{
  const [student, setStudent] = useState<Array<studentResponse>>([])
  useEffect(() => {
    const api = axios.create({baseURL: `http://localhost:5000/api`}); 
      ( async () => {
        let res1 = await api.get<programResponse[]>('/programs');
        let res2 = await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID}});
        let res3 = await api.get<studentResponse[]>('/students', {params: {courseID: res2.data[0].courseID}});
        setStudent(res3.data)
      }) ()
  },[])
  const thisStd:studentResponse = student.find(e => e.studentID == studentID);
  const [state, setState] = useState("Quiz");
  return (<MainDiv>
    <BackButton onClick={() => navigate(-1)}>
      <i className="fa fa-arrow-left"></i>Back
    </BackButton>
    <h4 style={{position: "absolute", left: 0, right: 0, textAlign: "center"}}>Individual Summary</h4>
    <h6>Student ID: {thisStd.studentID}</h6>
    <h6>Name : {thisStd.studentName}</h6>
    {/* <h6>Email : {student[parseInt(params.id)].studentName}</h6> */}
    <DashboardDiv>
      <ButtonTab>
        <button onClick={() => setState("Quiz")} style={{marginRight: 5}}>Quiz Score</button>
        <button onClick={() => setState("Outcome")}>Outcome Score</button>
        {state === "Outcome" && <ExportOutcome/>}
      </ButtonTab>
      {state === "Quiz" && <QuizScore/>}
      {state === "Outcome" && <OutcomeScore/>}
    </DashboardDiv>
  </MainDiv>)
}

function QuizScore() {
  const quizs: Array<quizscore> = [{id: 0, score: "1/1", detail: "How to Java"},
  {id: 1, score: "2/2", detail: "Hello World"}, {id: 2, score: "2/2", detail: "Advanced Java"}]
  const QuizHead: Array<string> = ['Quiz', 'Max Score', 'Student Score']
  for (let i = 0; i < quizs.length; i++) { //count unique quiz id
    QuizHead.push('Question' + (i + 1));
  }
  return (
    <ScoreTable score={quizs} tablehead={QuizHead} isIndividual={true} dataType="quiz" />
  )
}
  
function OutcomeScore() {
  const PLOs: Array<PLOscore> = [{ id: 0, score: "100%", detail: "LO1 100% \n LO2 100% \n LO3 100%" },
  { id: 1, score: "80%", detail: "LO1 100% \n LO2 100% \n LO3 100%" }, { id: 2, score: "-", detail: "No score" }]
  const PLOHead: Array<string> = ['PLO', 'Max Score', 'Student Score']
  for (let i = 0; i < PLOs.length; i++) { //count unique plo id
    PLOHead.push('LO' + (i + 1));
  }
  return (
    <ScoreTable score={PLOs} tablehead={PLOHead} isIndividual={true} dataType="plo" />
  )
}

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