import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import { TableSort } from '.';
import { ChartBarAverage } from './chart';
import { ExportOutcome2 } from './export';

export interface StudentUpload {
  studentID: string;
  studentEmail: string;
  studentName: string;
  studentSurname: string;
}

export interface DashboardResponse {
  students: Map<string, string>; // key: "StudentID" value: "StudentName"
  plos: Map<string, string>; // key: "PLO_ID: value: "PLO_Name"
  los: Map<string, string>; // key: "LO_ID,level" (there is a commna) value: Level_Description, or just "LO_ID" for LO title
  questions: { // merge questions from every quizzes
    questionTitle: string;
    maxScore: number;
    results: {
     studentID: string;
     studentScore: number;
    }[];
    linkedPLOs: string[]; // to tell how many PLOs it is related, format: ["00001", "00002"]
    linkedLOs: string[]; // to tell how many LOs it is related, format: ["LO_ID,level"] = ["100001,2"]
  }[];
}

export interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}
  
export function ScoreTablePLO (props: { programID: string, courseID: string }) {
  const [dscore, setDscore] = useState<DashboardResponse>({
    students: new Map<string, string>(), plos: new Map<string, string>(),
    los: new Map<string, string>(), questions:[],} );
  const [tableHead, setHead] = useState<string[]>([])
  const [tableData, setData] = useState<studentResult[]>([]);

  useEffect(() => {
    const api = axios.create({ baseURL: `http://localhost:5000/api` });
    ( async () => {
      const [res1,res2] = await Promise.all([
      api.get<DashboardResponse>('/dashboard-flat', { params: { programID: props.programID, courseID: props.courseID } }),
      api.get<Array<Map<string,string[]>>>("dashboard-plosummary", {params: { programID: props.programID, courseID: props.courseID }})
    ])
    setDscore(res1.data);
    calculatePLO(res1.data,res2.data);
    }) ()
  },[])

  const [studentLOScore, setLOS] = useState<studentResult[]>([]);  
  const [studentLOHead, setLOH] = useState<string[]>(['Student ID','Student Name']); 
  const [studentPLOScore, setPLOS] = useState<studentResult[]>([]); 
  const [studentPLOHead, setPLOH] = useState<string[]>(['Student ID','Student Name']); 

  function calculatePLO(score:DashboardResponse, plolink:Array<Map<string,string[]>>) {
    console.log("calculate",score)
    console.log("plolink", plolink)
    const std = []; // score index will be based on student in this response
    const stdname = []; // name for the table
    Object.entries(score.students).map(([k,v]) => { std.push(k); stdname.push(v); })
    let loScore = []; let loScoreC = []; // for counting purpose, plo score go down
    let questions = score.questions;
    let loArr:Array<number[]> = [];
    let loName: Array<string> = []; let loID: Array<string> = [];
    let ploID: Array<string> = [];  let ploName: Array<string> = [];
    Object.entries(score.plos).map(([k, v]) => { ploName.push(v); ploID.push(k) })
    Object.entries(score.los).map(([k, v]) => { 
      if(k.split(',').length === 1){ loName.push(v); loID.push(k) } });
    loName.sort(); loID.sort(); ploName.sort(); ploID.sort();
    let lotemp = 0;
    for (var key in score.los) { // create lo lvl scoring
      let temp = key.split(',')
      if (temp.length === 1){
        if (lotemp!=0) {
          loArr.push(Array.from({length: lotemp}, () => 0));
          lotemp = 0;
        }
      }else{ 
        if(lotemp < parseInt(temp[1])) { lotemp += parseInt(temp[1])-lotemp }
      }
    }
    if (lotemp!=0) {
      loArr.push(Array.from({length:lotemp}, () => 0))
      lotemp = 0;
    } // end lvl scoring creation
    console.log("loArrayy", loArr)
    console.log("loArr",loArr); // something wrong with loArr
    for (var i in std) {
      loScore.push([]); loScoreC.push([]);
      for(var j in loArr) {
        loScore[i].push(Array.from({length:loArr[j].length}, () => 0));
        loScoreC[i].push(Array.from({length:loArr[j].length}, () => 0));
      }
    }
    for (let i = 0; i < questions.length; i++) { // main calculation ; end with array of lo level
      for (let k = 0; k < questions[i].linkedLOs.length; k++) { // calculate each linked lo in the question
        let loidx = loID.indexOf(loID.find(e => e == questions[i].linkedLOs[k].split(',')[0]))
        let lvlidx = parseInt(questions[i].linkedLOs[k].split(',')[1])-1;
        // index of level, all combined will be [student][lo][level]
        for (let j = 0; j < questions[i].results.length; j++) { // might have to loop after link check
          let currentScore = 0;
          try{//prevent null
            currentScore = (questions[i].results[j].studentScore / questions[i].maxScore) * 100;
            if(isNaN(currentScore)) {currentScore = 0;}
          }
          catch{
            currentScore = 0;
          }
          let stdidx = std.indexOf(std.find(e => e == questions[i].results[j].studentID));
          loScore[stdidx][loidx][lvlidx] += currentScore;
          loScoreC[stdidx][loidx][lvlidx] += 1;
        }
      }
    }
    console.log("loscore",loScore);
    let lvlRes:Array<Array<number[]>> = loScore.slice();
    let lvlResC:Array<Array<number[]>> = loScoreC.slice();
    for (let i = 0; i < lvlRes.length; i++) { // calculate lolevel final
      for (let j = 0; j < lvlRes[i].length; j++) {
        for (let k = 0; k < lvlRes[i][j].length; k++) {
          lvlRes[i][j][k] = lvlRes[i][j][k]/lvlResC[i][j][k]; // find average of each level
        }
      }
    }
    // calculate lo score after lvl is done
    let loRes:Array<Number[]> = [];
    for (let i = 0; i < lvlRes.length; i++) { // calculate lo score
      loRes.push([]);
      let c = 0; let scs = 0; // c for counting, scs for score
      for (let j = 0; j < lvlRes[i].length; j++) {
        lvlRes[i][j].map((sc,k) => {
         if(k == 0 && scs !== 0) { // check for start of level
            let score = scs/c;
            if(isNaN(score)) { score = 0; }
            loRes[i].push(parseInt(score.toFixed(0)));
            scs = sc; c = 1;
          } else { scs += sc;  c += 1; }
        })
        if(scs !== 0) { 
          let score = scs/c;
          if(isNaN(score)) { score = 0; }
          loRes[i].push(parseInt(score.toFixed(0)));
          scs = 0;  c = 0;
        }
      }
    }// end of lo score calculation
    for (let i = 0; i < loName.length; i++) {
      studentLOHead.push(loName[i].substring(0,4)+" (%)");
    }
    setLOH(studentLOHead.slice());
    for (let i = 0; i < loRes.length; i++) {
      studentLOScore.push({studentID: std[i], studentName: stdname[i] ,scores: [...loRes[i]]})
    }
    setLOS(studentLOScore.slice());
    console.log(studentLOHead); console.log(studentLOScore);
    //////////////////////////////////////////////////////////////
    //plo section
    let ploScore:Array<Number[]> = [];
    for (let i = 0; i < std.length; i++) {
      ploScore.push([]); ploScore[i] = Array.from({length: ploID.length}, () => 0);
    }
    let linkIndex:Array<number[]> = [];
    let pc = 0; let psc = 0;
    Object.entries(plolink).map(([k,v]) => { // register which lo is linked (index)
      let temp = [];
      Object.entries(v).map(([kk,vv]) => { // each of linked lo
        temp.push(loID.indexOf(vv))
      })
      linkIndex.push(temp);
    });
    for (let i = 0; i < std.length; i++) { // start plo calculation
      for (let j = 0; j < ploScore[i].length; j++) { // select plo of this student
        let psc:any = 0;
        for (let k = 0; k < linkIndex[j].length; k++) {
          if(isNaN(loRes[i][linkIndex[j][k]] as number)) { loRes[i][linkIndex[j][k]] = 0; }
          psc += loRes[i][linkIndex[j][k]];
        }
        let res = parseInt((psc/linkIndex[j].length+1).toFixed(0))-1
        ploScore[i][j] = res;
      }
    } // calculation end
    for (let i = 0; i < ploName.length; i++) {
      studentPLOHead.push(ploName[i]+" (%)");
    }
    setPLOH(studentPLOHead.slice()); 
    setHead(studentPLOHead.slice()); // set as start
    for (let i = 0; i < ploScore.length; i++) {
      studentPLOScore.push({studentID: std[i], studentName: stdname[i] ,scores: [...ploScore[i]]})
    }
    setPLOS(studentPLOScore.slice());
    setData(studentPLOScore.slice());// set as start
  }  

  const [dataType, setType] = useState("PLO");
  function handleData(e: any){ setType(e.target.value) }
  useEffect(() => {
    if(dataType == "PLO"){
      setHead(studentPLOHead.slice()); setData(studentPLOScore.slice());
    }else{
      setHead(studentLOHead.slice());  setData(studentLOScore.slice());
    }
  }, [dataType])


  return (
    <div>
      <ExportOutcome2 programID={props.programID} courseID={props.courseID} datas={tableData} head={tableHead}/>
      <ChartBarAverage data={tableData}/>
      {/* <AllStudentChart data={tableData} chartType={chartType}/> */}
      <br/>
      <div style={{display:"inline"}}>
      <select value={dataType} onChange={handleData} className="border rounded-md border-2 ">
        <option value="PLO">PLO</option>
        <option value="LO">LO</option>
      </select>
      </div>
      <Table striped bordered hover className="table" style={{margin: 0, width: "65%"}}>
        <thead>
          <tr>
            {tableHead.map(head => (<th>{head}<TableSort /></th>))}
          </tr>
        </thead>
        <tbody>
          {tableData.map(data => (
            <tr>
              <td><LinkedCol to={`./${data.studentID}`}>{data.studentID}</LinkedCol></td>
              <td><LinkedCol to={`./${data.studentID}`}>{data.studentName}</LinkedCol></td>
              {data.scores.map(scores => ( // map score of this student's id
                // <Overlay score={scores.score} detail={[scores.detail]} />
                <td>{scores}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Quiz Table
export interface quizScoreResponse {
  quizName: string;
  maxScore: number;
  results: {
    studentID: string;
    studentName: string;
    studentScore: number;
  }[];
}[]

export function ScoreTable (props: { programID: string, courseID: string }) {
  useEffect(() => {
    const api = axios.create({ baseURL: `http://localhost:5000/api` });
    ( async () => {
      const [res1,res2] = await Promise.all([
      api.get<StudentUpload[]>('/students', { params: { programID: props.programID, courseID: props.courseID } }),
      api.get<quizScoreResponse[]>('/dashboard-result', { params: { programID: props.programID, courseID: props.courseID } })
    ])
    displayScore(res1.data, res2.data);
    }) ()
  },[])

  const [tableData, setData] = useState<studentResult[]>([]); // use this name since there only one type of table shown
  const [tableHead, setHead] = useState<string[]>(['Student ID','Student Name']); 

  function displayScore(student: StudentUpload[], score: quizScoreResponse[]) {
    console.log("Quizzes score", score)
    let quizScore:Array<Number[]> = [];
    let sID:Array<string> = [];
    for (var i in student) {
      quizScore.push([]); sID.push(student[i].studentID);;
    }
    console.log(sID);
    for (let i = 0; i < score.length; i++) { // adding to new array
      for (let j = 0; j < sID.length; j++) {
        try{ // check if NaN
          let stdScore = score[i].results.find(e => e.studentID == sID[j]).studentScore;
          stdScore = parseInt(((stdScore/score[i].maxScore)*100).toFixed(0)); // find percentage
          console.log(stdScore)
          quizScore[j].push(stdScore);
        }
        catch{ quizScore[j].push(0); }
      }
    } 
    for (let i = 0; i < score.length; i++) {
      tableHead.push(score[i].quizName + " (%)");
    }
    setHead(tableHead.slice());
    for (let i = 0; i < quizScore.length; i++) {
      tableData.push({studentID: sID[i], 
      studentName: student.find(e => e.studentID == sID[i]).studentName, 
      scores: quizScore[i]})
    }
    setData(tableData.slice());
    console.log(tableData);
  }

  return (
    <div>
      <ChartBarAverage data={tableData}/>
      <br/><br/>
      <Table striped bordered hover className="table" style={{margin: 0, width: "65%"}}>
        <thead>
          <tr>
            {tableHead.map(head => (<th>{head}<TableSort /></th>))}
          </tr>
        </thead>
        <tbody>
          {tableData.map(data => (
            <tr>
              <td><LinkedCol to={`./${data.studentID}`}>{data.studentID}</LinkedCol></td>
              <td><LinkedCol to={`./${data.studentID}`}>{data.studentName}</LinkedCol></td>
              {data.scores.map(scores => ( // map score of this student's id
                // <Overlay score={scores.score} detail={[scores.detail]} />
                <td>{scores}</td>
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
