import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import { TableSort } from '.';
import { studentResponse } from '../../../../../../shared/initialData';
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

interface tableData {
  shortname: string,
  maxscore: number
}

export interface StudentUpload {
  studentID: string;
  studentEmail: string;
  studentName: string;
  studentSurname: string;
}

const Quizinfo: Array<tableData> = [{shortname: 'Quiz 1', maxscore: 5},
  {shortname: 'Quiz 2', maxscore: 10}, {shortname: 'Quiz 3', maxscore: 10}]
const PLOinfo: Array<tableData> = [{shortname: 'PLO 1', maxscore: 100},
  {shortname: 'PLO 2', maxscore: 100}, {shortname: 'PLO 3', maxscore: 100}]
  
export function ScoreTable (props: {
  programID: string, courseID: string, score: Array<any>, tablehead: Array<string>, dataType: string}) {
    const [students, setStudents] = useState<StudentUpload[]>([]);
    useEffect(() => {
      const api = axios.create({ baseURL: `http://localhost:5000/api` }); 
      api
        .get<StudentUpload[]>('/students', {params: { programID: props.programID, courseID: props.courseID }})
        .then((res) => res.data).then(setStudents);
    }, [])
    return(
      <div>
        <Chart dataType = {props.dataType}/>
        <Table striped bordered hover className="table" style={{margin: 0, width: "65%"}}>
          <thead>
            <tr>
              {props.tablehead.map(thdata => (<th>{thdata}<TableSort/></th>))}
            </tr>
          </thead>
          <tbody>
            {students.map(std => (
              <tr>
                <td><LinkedCol to={`./${std.studentID}`}>{std.studentID}</LinkedCol></td>
                <td><LinkedCol to={`./${std.studentID}`}>{std.studentName}</LinkedCol></td>
                {props.score.map(scores =>( // map score of this student's id
                  <Overlay score={scores.score} detail={[scores.detail]}/>
                ))}
              </tr>
              ))}
          </tbody>
        </Table>
      </div>
    )
}

export function ScoreTableIndividual (props: {courseID: string, score: Array<any>, tablehead: Array<string>, dataType: string}) {
    //set quiz or stuff here    
    let data = []
    if (props.tablehead[0] == 'PLO') { data = PLOinfo }
    else { data = Quizinfo }
      return(
        <div>
          <Chart dataType = {props.dataType}/>
          <Table striped bordered hover className="table" style={{margin: 0, width: "65%"}}>
            <thead>
              <tr>
                {props.tablehead.map(thdata => (<th>{thdata}<TableSort/></th>))}
              </tr>
            </thead>
            <tbody>
              {data.map(qi => ( //individual page
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
