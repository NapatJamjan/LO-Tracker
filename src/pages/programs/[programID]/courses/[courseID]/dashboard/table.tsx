import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import { studentResponse, programResponse, courseResponse } from '../../../../../../shared/initialData';
import { TableSort } from '../student';
import {Chart} from './chart';

export interface quizscore {
  id: number,
  score: string,
  detail: string;
}

export interface PLOscore {
  id: number,
  score: string,
  detail: string;
}

interface tablehead {
  shortname: string,
  maxscore: number
}

const Quizinfo: Array<tablehead> = [{shortname: 'Quiz 1', maxscore: 5},
  {shortname: 'Quiz 2', maxscore: 10}, {shortname: 'Quiz 3', maxscore: 10}]
const PLOinfo: Array<tablehead> = [{shortname: 'PLO 1', maxscore: 100},
  {shortname: 'PLO 2', maxscore: 100}, {shortname: 'PLO 3', maxscore: 100}]

export function ScoreTable (props: {score: Array<any>, tablehead: Array<string>, isIndividual: boolean, dataType: string}) {
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
  
  let tableHeadInfo = []
  if (props.tablehead[0] == 'PLO') { tableHeadInfo = PLOinfo }
  else { tableHeadInfo = Quizinfo }
    return(
      <div>
        <Chart dataType = {props.dataType}/>
        <Table striped bordered hover className="table" style={{margin: 0, width: "55%"}}>
          <thead>
            <tr>
              {props.tablehead.map(thdata => (<th>{thdata}<TableSort/></th>))}
            </tr>
          </thead>
          <tbody>
            {props.isIndividual === false &&  student.map(std => (
              <tr>
                <td><LinkedCol to={`./${std.studentID}`}>{std.studentID}</LinkedCol></td>
                <td><LinkedCol to={`./${std.studentID}`}>{std.studentName}</LinkedCol></td>
                {props.score.map(scores =>( // map score of this student's id
                  <Overlay score={scores.score} detail={[scores.detail]}/>
                ))}
              </tr>)) || tableHeadInfo.map(qi => ( //individual page
                <tr>
                  <td>{qi.shortname}</td>
                  <td>{qi.maxscore}</td>
                  <td>{qi.maxscore}</td>
                  {props.score.map(scores => (
                  <Overlay score={scores.score} detail={[scores.detail]}/>
                ))}
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    )
}

function Overlay(props: any) {
  return(
    <td>
      <OverlayTrigger placement="auto-start" overlay={HoverText({detail: props.detail})} 
        delay={{show: 50, hide: 100}}>
        <p>{props.score}</p>
      </OverlayTrigger>
    </td>
  )
}

const HoverText = (props:any) =>(
    <Tooltip {...props}>
      <p style={{whiteSpace:"pre-line"}}>{props.detail}</p>
    </Tooltip>
);

const LinkedCol = styled(Link)`
  text-decoration:none;
  color:black;
`;
