import axios from 'axios';
import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../../../../components/layout';
import { ScoreTable, ScoreTablePLO } from './table';
import { Link } from 'gatsby';
import Seo from '../../../../../../components/seo';
import { CourseNameLink, ProgramNameLink } from '../../../../../../components/namebar';

const Dashboard: React.FC<{programID:string, courseID: string}> = ({programID, courseID}) => {
  const [state, setState] = useState("Quiz");
  return (<Layout>
    <Seo title="Dashboard" />
    <p>
      <Link to="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <Link to="/programs">Programs</Link>
      &nbsp;&#12297;&nbsp;
      <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
        &nbsp;&#12297;&nbsp;
      <CourseNameLink programID={programID} courseID={courseID} to="../" />
      &nbsp;&#12297;&nbsp;
      <span>Dashboard</span>
    </p>
    <DashboardDiv>
      <h2 style={{textAlign: "center"}}>Summary</h2>
      <ButtonTab>
        <button onClick={() => setState("Quiz")} style={{marginRight: 5}}
        className="border rounded-md border-2">Quiz Score</button>
        <button onClick={() => setState("Outcome")}
        className="border border-blue-500 rounded-md border-2">Outcome Score</button>
      </ButtonTab>
      {state === "Quiz" && <div> <ScoreTable programID={programID} courseID={courseID}/> </div>}
      {state === "Outcome" && <div> <ScoreTablePLO programID={programID} courseID={courseID}/> </div>}
    </DashboardDiv>
  </Layout>);
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