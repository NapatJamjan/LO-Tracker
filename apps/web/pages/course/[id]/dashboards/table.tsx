import { useDashboardFlat, useDashboardPLOSummary, useDashboardResult, useStudent } from 'apps/web/utils/dashboard-helper';
import Head from 'next/head';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import styled from 'styled-components';
import ClientOnly from '../../../../components/ClientOnly';
import { AllStudentChart } from './chart';
import { ExportOutcome2 } from './export';

// path => /course/[id]/dashboards/table
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly>
      <TablePage/>
    </ClientOnly>
  </div>);
};

function TablePage() {
  const router = useRouter();
  const courseID = router.query.id as string;
  return <div>
    Hello {courseID}
  </div>;
};

export interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

interface loData {
  id: string,
  name: string
}

export function ScoreTablePLO() {
  const courseID = router.query.id as string;
  const [dashboardFlat] = useDashboardFlat(courseID);
  const [dashboardPLO] = useDashboardPLOSummary(courseID);
  const [tableHead, setHead] = useState<string[]>([])
  const [tableData, setData] = useState<studentResult[]>([]);
 
  const [studentLOScore, setLOS] = useState<studentResult[]>([]);  
  const [studentLOHead, setLOH] = useState<string[]>(['Student ID','Student Name']); 
  const [studentPLOScore, setPLOS] = useState<studentResult[]>([]); 
  const [studentPLOHead, setPLOH] = useState<string[]>(['Student ID','Student Name']); 

  useEffect(() => {
    calculatePLO()
  }, [dashboardFlat]) //probably work

  function calculatePLO() {
    let score = dashboardFlat;
    let plolink = dashboardPLO;
    const std = []; // score index will be based on student in this response
    const stdname = []; // name for the table
    score.students.forEach((v, k) => {
      std.push(k); stdname.push(v);
    })
    let loScore = []; let loScoreC = []; // for counting purpose, plo score go down
    let questions = score.questions;
    let loArr: Array<number[]> = [];
    let loData: Array<loData> = [];
    let ploData: Array<loData> = [];
    score.plos.forEach((v, k) => {
      ploData.push({name: v, id: k});
    })
    score.los.forEach((v, k) => {
      if(k.split(',').length === 1){
        loData.push({name: v, id: k});
      }
    })
    console.log("pre", loData.slice())
    loData.sort((a: any, b: any) => {
      if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    })
    console.log("post", loData.slice())
    ploData.sort((a: any, b: any) => {
      if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    }) 
    score.los.forEach((v, k) => { // make loArr
      if(k.split(',').length === 1){ loArr.push([]) }
    })
    let lotemp = 0;
    let temp = []
    let tempprev = "";
    score.los.forEach((v, k) => {  // create lo lvl scoring
      temp = k.split(',')
      if (temp.length === 1){
        if (lotemp!=0) { // end current lo
          let loidx = loData.indexOf(loData.find(e => e.id == tempprev))
          loArr[loidx] = Array.from({length: lotemp}, () => 0);
          lotemp = 0;
        }
      }else{ 
        // if(lotemp < parseInt(temp[1])) { lotemp += parseInt(temp[1])-lotemp; } // broke if level is like 1 2 9
        lotemp += 1;
        tempprev = temp[0]
      }
    })
    if (lotemp!=0) { // end when loop stopped
      let loidx = loData.indexOf(loData.find(e => e.id == temp[0]))
      loArr[loidx] = Array.from({length: lotemp}, () => 0)
      lotemp = 0;
    } // end lvl scoring creation

    for (var i in std) {
      loScore.push([]); loScoreC.push([]);
      for(var j in loArr) {
        loScore[i].push(Array.from({length: loArr[j].length}, () => 0));
        loScoreC[i].push(Array.from({length: loArr[j].length}, () => 0));
      }
    }
    console.log(questions) // lo seem to calculate error when the order got changed, loArr is wrong /////
    for (let i = 0; i < questions.length; i++) { // main calculation ; end with array of lo level
      for (let k = 0; k < questions[i].linkedLOs.length; k++) { // calculate each linked lo in the question
        let loidx = loData.indexOf(loData.find(e => e.id == questions[i].linkedLOs[k].split(',')[0]))
        let lvlidx = parseInt(questions[i].linkedLOs[k].split(',')[1])-1;
        // console.log("hh", loidx, lvlidx)
        // index of level, all combined will be [student][lo][level]
        for (let j = 0; j < questions[i].results.length; j++) { // might have to loop after link check
          let currentScore = 0;
          try{//prevent null
            currentScore = (questions[i].results[j].studentScore / questions[i].maxScore) * 100;
            if(isNaN(currentScore)) {currentScore = 0;}
          }
          catch{ currentScore = 0; }
          let stdidx = std.indexOf(std.find(e => e == questions[i].results[j].studentID.toString()));
          if(stdidx != -1){
            if(loScore[stdidx][loidx][lvlidx] != null){
            loScore[stdidx][loidx][lvlidx] += currentScore;
            loScoreC[stdidx][loidx][lvlidx] += 1;        
            }
          }
        }
      }
    }

    let lvlRes: Array<Array<number[]>> = loScore.slice();
    let lvlResC: Array<Array<number[]>> = loScoreC.slice();
    for (let i = 0; i < lvlRes.length; i++) { // calculate lolevel final
      for (let j = 0; j < lvlRes[i].length; j++) {
        for (let k = 0; k < lvlRes[i][j].length; k++) {
          lvlRes[i][j][k] = lvlRes[i][j][k] / lvlResC[i][j][k]; // find average of each level
        }
      }
    }
    // calculate lo score after lvl is done
    let loRes: Array<Number[]> = [];
    for (let i = 0; i < lvlRes.length; i++) { // calculate lo score
      loRes.push([]);
      let c = 0; let scs = 0; // c for counting, scs for score
      for (let j = 0; j < lvlRes[i].length; j++) {
        lvlRes[i][j].map((sc,k) => {
          if (k == 0 && scs !== 0) { // check for start of new level
            let score = scs / c;
            if (isNaN(score)) { score = 0; }
            loRes[i].push(parseInt(score.toFixed(0)));
            scs = sc; c = 1;
          } else { 
            if(isNaN(sc)) { sc = 0;}
            scs += sc; 
            c += 1; 
          }
        })
        if(scs !== 0) { 
          let score = scs/c;
          if(isNaN(score)) { score = 0; }
          loRes[i].push(parseInt(score.toFixed(0)));
          scs = 0;  c = 0;
        }
      }
    }// end of lo score calculation
    for (let i = 0; i < loData.length; i++) {
      studentLOHead.push(loData[i].name.substring(0,4));
    }
    setLOH(studentLOHead.slice());
    for (let i = 0; i < loRes.length; i++) {
      studentLOScore.push({studentID: std[i], studentName: stdname[i] ,scores: [...loRes[i]]})
    }
    setLOS(studentLOScore.slice());

    //plo section
    let ploScore: Array<Number[]> = [];
    for (let i = 0; i < std.length; i++) {
      ploScore.push([]); ploScore[i] = Array.from({length: ploData.length}, () => 0);
    }
    let linkIndex: Array<number[]> = Array.from({length: ploData.length}, () => []);
    plolink.forEach((v, k) => { // register which lo is linked (index)
      let temp = [];
      let ploindex = ploData.indexOf(ploData.find(e => e.id == k))
      v.forEach((vv, kk) => { // each of linked lo
        temp.push(loData.indexOf(loData.find(e => e.id == vv)))
      })
      linkIndex[ploindex] = (temp);
    });

    for (let i = 0; i < std.length; i++) { // start plo calculation
      for (let j = 0; j < ploScore[i].length; j++) { // select plo of this student
        // let ploidx = loData.indexOf(loData.find(e => e.id == questions[i].linkedLOs[k].split(',')[0]))
        let psc: any = 0;
        for (let k = 0; k < linkIndex[j].length; k++) {
          if(isNaN(loRes[i][linkIndex[j][k]] as number)) { loRes[i][linkIndex[j][k]] = 0; }
          psc += loRes[i][linkIndex[j][k]];
        }
        let res = parseInt((psc/linkIndex[j].length+1).toFixed(0))-1
        ploScore[i][j] = res;
      }
    } // calculation end
    for (let i = 0; i < ploData.length; i++) {
      studentPLOHead.push(ploData[i].name);
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
  const [chartType, setChartType] = useState("avg");
  function handleDataType(e: any){ setType(e.target.value) }
  function handleChartType(e: any){ setChartType(e.target.value) }
  useEffect(() => {
    if(dataType == "PLO"){
      setHead(studentPLOHead.slice()); setData(studentPLOScore.slice());
    }else{
      setHead(studentLOHead.slice());  setData(studentLOScore.slice());
    }
  }, [dataType])
  return (
    <div>
      <ExportOutcome2 datas={tableData} head={tableHead}/>
      <AllStudentChart data={tableData} chartType={chartType} scoreType="Outcome" tableHead={tableHead.slice(2)}/>
      <br/>
      <div style={{display: "inline"}}>
        <select value={dataType} onChange={handleDataType} className="border rounded-md border-2 ">
          <option value="PLO">PLO</option>
          <option value="LO">LO</option>
        </select>
        <div style={{display: "inline", marginLeft: 10}}>
          <span style={{marginRight: 5}}>Data Type</span>
          <select value={chartType} onChange={handleChartType} className="border rounded-md border-2 ">
            <option value="avg">Average Scores</option>
            <option value="all">Student Scores</option>
          </select>
        </div>
      </div>
      <Table striped bordered hover className="table" style={{margin: 0, width: "60%"}}>
        <thead>
          <tr>
            {tableHead.map((head, i) => (<th>{head}{i > 1 && <span> (%)</span>}</th>))}
          </tr>
        </thead>
        <tbody>
          {tableData.map(data => (
            <tr>
              <td><LinkedCol href={`/course/${courseID}/dashboards/${data.studentID}`}>{data.studentID}</LinkedCol></td>
              <td><LinkedCol href={`/course/${courseID}/dashboards/${data.studentID}`}>{data.studentName}</LinkedCol></td>
              {data.scores.map(scores => (
                <td>{scores}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}


export function ScoreTable() {
  const courseID = router.query.id as string;
  const [students] = useStudent(courseID);
  const [dashboardQuiz] = useDashboardResult(courseID);

  const [tableData, setData] = useState<studentResult[]>([]);
  const [tableHead, setHead] = useState<string[]>(['Student ID', 'Student Name']); 

  useEffect(() => {
    displayScore()
  }, [dashboardQuiz.length > 0 && students.length > 0])

  function displayScore(){
    let score = dashboardQuiz
    let quizScore: Array<Number[]> = [];
    let sID: Array<string> = [];
    for (var i in students) {
      quizScore.push([]); sID.push(students[i].id);
    }
    for (let i = 0; i < score.length; i++) { // adding to new array
      for (let j = 0; j < sID.length; j++) {
        try { // check if NaN
          let stdScore = score[i].results.find(e => e.studentID == sID[j]).studentScore;
          stdScore = parseInt(((stdScore / score[i].maxScore) * 100).toFixed(0)); // find percentage
          quizScore[j].push(stdScore);
        }
        catch { quizScore[j].push(0); }
      }
    }
    for (let i = 0; i < score.length; i++) {
      tableHead.push(score[i].quizName.substring(0, 6));
    }
    setHead(tableHead.slice());
    for (let i = 0; i < quizScore.length; i++) {
      tableData.push({
        studentID: sID[i],
        studentName: students.find(e => e.id == sID[i]).fullname,
        scores: quizScore[i]
      })
    }
    setData(tableData.slice());
  }
  
  const [chartType, setChartType] = useState("avg");
  function handleChartType(e: any){ setChartType(e.target.value) }

  return <div>
    <AllStudentChart data={tableData} chartType={chartType} scoreType="Quiz" tableHead={tableHead.slice(2)}/>
    <br/>
      <div style={{display: "inline"}}>
        <span style={{marginRight: 5}}>Data Type</span>
        <select value={chartType} onChange={handleChartType} className="border rounded-md border-2 ">
          <option value="avg">Average Scores</option>
          <option value="all">Student Scores</option>
        </select>
      </div>
    <Table striped bordered hover className="table" style={{ margin: 0, width: "60%" }}>
      <thead>
        <tr>
          {tableHead.map((head, i) => (<th>{head}{i > 1 && <span> (%)</span>}</th>))}
        </tr>
      </thead>
      <tbody>
        {tableData.map(data => (
          <tr>
            <td><LinkedCol href={`/course/${courseID}/dashboards/${data.studentID}`}>{data.studentID}</LinkedCol></td>
            <td><LinkedCol href={`/course/${courseID}/dashboards/${data.studentID}`}>{data.studentName}</LinkedCol></td>
            {data.scores.map(scores => (
              <td>{scores}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
}

const LinkedCol = styled(Link)`
  text-decoration:none;
  color:black;
`;
