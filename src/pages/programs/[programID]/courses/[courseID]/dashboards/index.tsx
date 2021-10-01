import axios from 'axios';
import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../../../../components/layout';
import { quizscore, ScoreTable, PLOscore } from './table';
import { Link } from 'gatsby';
import Seo from '../../../../../../components/seo';
import { ExportOutcome } from './exportoutcome';

const Dashboard: React.FC<{programID:string, courseID: string}> = ({programID, courseID}) => {
  const [state, setState] = useState("Quiz");
  return (<Layout>
    <Seo title="Dashboard" />
    <p>
      <Link to="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <Link to="/programs">Programs</Link>
      &nbsp;&#12297;&nbsp;
      <Link to={`/programs/${programID}/courses`}>{programID}</Link>
      &nbsp;&#12297;&nbsp;
      <Link to="../">{courseID}</Link>
      &nbsp;&#12297;&nbsp;
      <span>Dashboard</span>
    </p>
    <DashboardDiv>
      <h2 style={{textAlign: "center"}}>Summary</h2>
      <ButtonTab>
        <button onClick={() => setState("Quiz")} style={{marginRight: 5}}>Quiz Score</button>|
        <button onClick={() => setState("Outcome")}>Outcome Score</button>
        {state === "Outcome" && <ExportOutcome courseID={courseID} />}
      </ButtonTab>
      {state === "Quiz" && <QuizScore/>}
      {state === "Outcome" && <OutcomeScore/>}
    </DashboardDiv>
  </Layout>);
}

function QuizScore(){
  const quizs: Array<quizscore> = [{id: 1, score: "5/5", detail: "Part 1 : 2/2 \n Part 1 : 3/3"},
  {id: 2, score: "10/10", detail: "Part 1 : 10/10"}, {id: 3, score: "1/10", detail: "Part 1 : 1/5 \n Part 2 : 0/5"}]
  const QuizHead: Array<string> = ['ID', 'Name']
  for (let i = 0; i < quizs.length; i++) { //count unique quiz id
    QuizHead.push('Quiz'+(i+1));
  }
  return(
    <ScoreTable score={quizs} tablehead={QuizHead} isIndividual={false} dataType="quiz"/>
  )
}

function OutcomeScore(){
  const PLOs: Array<PLOscore> = [{id: 1, score: "100%", detail: "LO1 100% \n LO2 100% \n LO3 100%"},
  {id: 2, score: "80%", detail: "LO1 100% \n LO2 100% \n LO3 100%"}, {id: 3, score: "-", detail: "No score"},
  {id: 4, score: "-", detail: "No score"}]
  const PLOHead: Array<string> = ['ID', 'Name']
  for (let i = 0; i < PLOs.length; i++) { //count unique plo id
    PLOHead.push('PLO'+(i+1));
  }
  return(
    <ScoreTable score={PLOs} tablehead={PLOHead} isIndividual={false} dataType="plo"/>
  )
}

export default Dashboard;

const DashboardDiv = styled.div`
  text-align: left;
  margin-left : 1%;
  margin-right: 1%;
`;

const ButtonTab = styled.div`
  display: inline-block;
`;

export function TableSort(props: any) {
    return (
      <i className="fa fa-sort tableSort"></i>
    )
}