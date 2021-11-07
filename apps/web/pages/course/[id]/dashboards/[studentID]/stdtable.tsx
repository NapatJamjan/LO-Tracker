import { useDashboardFlat, useDashboardPLOSummary, useDashboardResult, useStudent } from 'apps/web/utils/dashboard-helper';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import ClientOnly from '../../../../../components/ClientOnly';
import { ChartBarAverage, ChartBarCompare } from '../chart';

// path => /course/[id]/dashboards/[studentID]/stdtable
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly>
      <StdtablePage/>
    </ClientOnly>
  </div>);
};

function StdtablePage() {
  const router = useRouter();
  const {id: courseID, studentID} = router.query; // extract id from router.query and rename to courseID, but not rename studentID
  return <div>
    Hello {courseID} {studentID}
  </div>;
};

interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

export function IndividualPLO(props: { courseID: string, studentID: string}) {
  const [dashboardFlat, loaded] = useDashboardFlat(props.courseID);
  const [dashboardPLO, loaded2] = useDashboardPLOSummary(props.courseID);
  const [tableHead, setHead] = useState<string[]>([])
  const [tableData, setData] = useState<studentResult[]>([]);
 
  const [allData, setAllData] = useState<studentResult[]>([]);
  const [totalLOScore, setTLOS] = useState<studentResult[]>([]);
  const [totalPLOScore, setTPLOS] = useState<studentResult[]>([]);
  const [studentLOScore, setLOS] = useState<studentResult[]>([]);  
  const [studentLOHead, setLOH] = useState<string[]>(['Student ID','Student Name']); 
  const [studentPLOScore, setPLOS] = useState<studentResult[]>([]); 
  const [studentPLOHead, setPLOH] = useState<string[]>(['Student ID','Student Name']); 

  useEffect(() => {
    calculatePLO()
  }, [dashboardFlat]) //probably work

  function calculatePLO() {
    let thisStudent = props.studentID;
    let score = dashboardFlat;
    let plolink = dashboardPLO;
    const std = []; // score index will be based on student in this response
    const stdname = []; // name for the table
    //object entries can be replaced by foreach now
    score.students.forEach((v, k) => {
      std.push(k);
      stdname.push(v);
    })
    let loScore = []; let loScoreC = []; // for counting purpose, plo score go down
    let questions = score.questions;
    let loArr:Array<number[]> = [];
    let loName: Array<string> = []; let loID: Array<string> = [];
    let ploID: Array<string> = [];  let ploName: Array<string> = [];
    score.plos.forEach((v, k) => {
      ploName.push(v); ploID.push(k);
    })
    score.los.forEach((v, k) => {
      if(k.split(',').length === 1){
        loName.push(v); loID.push(k);
      }
    })

    let lotemp = 0;
    // for (var key in score.los) { // create lo lvl scoring
    score.los.forEach((v, k) => {
      let temp = k.split(',')
      if (temp.length === 1){
        if (lotemp!=0) {
          loArr.push(Array.from({length: lotemp}, () => 0));
          lotemp = 0;
        }
      }else{ 
        if(lotemp < parseInt(temp[1])) { lotemp += parseInt(temp[1])-lotemp }
      }
    })
    if (lotemp!=0) {
      loArr.push(Array.from({length: lotemp}, () => 0))
      lotemp = 0;
    } // end lvl scoring creation
 
    for (var i in std) {
      loScore.push([]); loScoreC.push([]);
      for(var j in loArr) {
        loScore[i].push(Array.from({length: loArr[j].length}, () => 0));
        loScoreC[i].push(Array.from({length: loArr[j].length}, () => 0));
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

    let stdidx = std.indexOf(std.find(e => e == thisStudent));
    for (let i = 0; i < loName.length; i++) {
      studentLOHead.push(loName[i].substring(0,4)+" (%)");
    }
    setLOH(studentLOHead.slice());
    let loTemp = []
    for (let i = 0; i < loRes.length; i++) {
      loTemp.push({studentID: std[i], studentName: stdname[i] ,scores: [...loRes[i]]})
    }
    setTLOS(loTemp.slice());
    setLOS([loTemp[stdidx]].slice());

    //plo section
    let ploScore:Array<Number[]> = [];
    for (let i = 0; i < std.length; i++) {
      ploScore.push([]); ploScore[i] = Array.from({length: ploID.length}, () => 0);
    }
    let linkIndex:Array<number[]> = [];
    plolink.forEach((v, k) => { // register which lo is linked (index)
      let temp = [];
      v.forEach((vv, kk) => { // each of linked lo
        temp.push(loID.indexOf(vv))
      })
      linkIndex.push(temp);
    });

    for (let i = 0; i < std.length; i++) { // start plo calculation
      for (let j = 0; j < ploScore[i].length; j++) { // select plo of this student
        let psc: any = 0;
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
    let ploTemp = []
    setPLOH(studentPLOHead.slice()); 
    setHead(studentPLOHead.slice()); // set as start
    for (let i = 0; i < ploScore.length; i++) {
      ploTemp.push({studentID: std[i], studentName: stdname[i] ,scores: [...ploScore[i]]}) 
    }
    ploTemp = ploTemp.filter(item => item).slice();
    setTPLOS(ploTemp.slice());
    setPLOS([ploTemp[stdidx]].slice());
    setAllData(ploTemp.slice()); // set as start
    setData([ploTemp[stdidx]].slice()); 
  }  

  const [compareID, setCompare] = useState("---");
  const [dataType, setType] = useState("PLO");
  function handleType(e: any) { setType(e.target.value) }
  function handleCompare(e: any) { setCompare(e.target.value) }
  useEffect(() => {
    if (dataType == "PLO") {
      let temp = studentPLOScore.slice()
      if(compareID != "---") { 
        let stdidx = totalPLOScore.indexOf(totalPLOScore.find(e => e.studentID == compareID));
        temp.push(totalPLOScore[stdidx]);
      }
      setHead(studentPLOHead.slice()); setData(temp.slice()); setAllData(totalPLOScore.slice());
    } else {
      let temp = studentLOScore.slice()
      if(compareID != "---") { 
        let stdidx = totalLOScore.indexOf(totalLOScore.find(e => e.studentID == compareID));
        temp.push(totalLOScore[stdidx]);
      }
      setHead(studentLOHead.slice()); setData(temp.slice()); setAllData(totalLOScore.slice());
    }
  }, [dataType])
  
  useEffect(() => {
    if(tableData.length != 0){
      if (compareID == "---" && tableData.length > 1) {
        let temp = [tableData[0]]; setData(temp.slice());
      }
      else {
        let temp = [tableData[0]];
        if(dataType == "PLO") {
          let stdidx = totalPLOScore.indexOf(totalPLOScore.find(e => e.studentID == compareID));
          temp.push(totalPLOScore[stdidx]);
          setData(temp.slice());
        } else{
          let stdidx = totalLOScore.indexOf(totalLOScore.find(e => e.studentID == compareID));
          temp.push(totalLOScore[stdidx]);
          setData(temp.slice());
        }
      }
    }
  }, [compareID])

  return (
    <div>
      <ChartBarCompare stdData={tableData} data={allData} scoreType="Outcome" tableHead={tableHead.slice(2)} />
      <br/>
      <div style={{display:"inline-block"}}>
        <select value={dataType} onChange={handleType} className="border rounded-md border-2 ">
          <option value="PLO">PLO</option>
          <option value="LO">LO</option>
        </select>
        <span>Compare to</span>
        <select value={compareID} onChange={handleCompare} className="border rounded-md border-2 ">
        <option value="---">---</option>
        {allData.map(std => (
          <option value={std.studentID}>{std.studentID}</option>
        ))}
        </select>
      </div>
      <br />
      <Table striped bordered hover className="table" style={{margin: 0, width: "60%"}}>
        <thead>
          <tr>
            {tableHead.map(head => (<th>{head}</th>))}
          </tr>
        </thead>
        <tbody>
          {tableData.map(data => (
            <tr>
              <td>{data.studentID}</td>
              <td>{data.studentName}</td>
              {data.scores.map(scores => ( // map score of this student's id
                <td>{scores}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export function IndividualQuiz (props: { courseID: string, studentID: string }) {
  const [students, loaded] = useStudent(props.courseID);
  const [dashboardQuiz, loaded2] = useDashboardResult(props.courseID);
  const [totalData, setTotalData] = useState<studentResult[]>([]);
  const [tableData, setData] = useState<studentResult[]>([]);
  const [tableHead, setHead] = useState<string[]>(['Student ID','Student Name']); 

  useEffect(() => {
    displayScore()
  }, [dashboardQuiz.length > 0 && students.length > 0]) //probably work

  function displayScore(){
    let thisStudent = props.studentID;
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
      tableHead.push(score[i].quizName);
    }
    setHead(tableHead.slice());
    for (let i = 0; i < quizScore.length; i++) {
      totalData.push({
        studentID: sID[i],
        studentName: students.find(e => e.id == sID[i]).fullname,
        scores: quizScore[i]
      })
      if(sID[i] == thisStudent){
        tableData.push({
          studentID: sID[i],
          studentName: students.find(e => e.id == sID[i]).fullname,
          scores: quizScore[i]
        })
      }
    }
    setTotalData(totalData.slice());
    setData(tableData.slice());
  }
  
  const [compareID, setCompare] = useState("---");
  function handleCompare(e: any) { setCompare(e.target.value) }
  useEffect(() => {
    if(tableData.length != 0) {
      if (compareID == "---" && tableData.length > 1) {
        let temp = [tableData[0]]; setData(temp.slice());
      }else{
        let temp = [tableData[0]];
        let stdidx = totalData.indexOf(totalData.find(e => e.studentID == compareID));
        temp.push(totalData[stdidx]);
        setData(temp.slice());
      }
    }
  }, [compareID])

  return <div>
    <ChartBarCompare stdData={tableData} data={totalData} scoreType="Quiz" tableHead={tableHead.slice(2)}/><br/>
    <span>Compare to</span>
      <select value={compareID} onChange={handleCompare} className="border rounded-md border-2 ">
        <option value="---">---</option>
        {totalData.map(std => (
          <option value={std.studentID}>{std.studentID}</option>
        ))}
        </select>
      <br/>
    <Table striped bordered hover className="table" style={{ margin: 0, width: "60%" }}>
      <thead>
        <tr>
          {tableHead.map(head => (<th>{head}</th>))}
        </tr>
      </thead>
      <tbody>
        {tableData.map(data => (
          <tr>
            <td>{data.studentID}</td>
            <td>{data.studentName}</td>
            {data.scores.map(scores => ( // map score of this student's id
              <td>{scores}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
}

//not working because the setdata thing please delete
export function IndividualQuiz2 (props: { courseID: string, studentID: string }) {
  const [students, loaded] = useStudent(props.courseID);
  const [dashboardQuiz, loaded2] = useDashboardResult(props.courseID);
  const [totalData, setTotalData] = useState<studentResult[]>([{ studentID: '0000', studentName: 'Loading', scores: [0] }]);
  const [tableData, setData] = useState<studentResult[]>([{ studentID: '0000', studentName: 'Loading', scores: [0] }]);
  const [tableHead, setHead] = useState<string[]>(['Student ID', 'Student Name']);
  
  useEffect(() => {
    displayScore()
  }, [dashboardQuiz.length > 0 && students.length > 0])

  function displayScore() {
    let thisStudent = props.studentID;
    let score = dashboardQuiz
    let quizScore: Array<Number[]> = [];
    let sID: Array<string> = [];
    for (var i in students) {
      quizScore.push([]); sID.push(students[i].id);
    }
    for (let i = 0; i < score.length; i++) { // adding to new array
      for (let j = 0; j < sID.length; j++) {
        try{ // check if NaN
          let stdScore = score[i].results.find(e => e.studentID == sID[j]).studentScore;
          if(isNaN(stdScore)){
            stdScore = 0;
          }
          stdScore = parseInt(((stdScore/score[i].maxScore)*100).toFixed(0)); // find percentage
          quizScore[j].push(stdScore);
        }
        catch{ quizScore[j].push(0); }
      }
    } 
    
    for (let i = 0; i < score.length; i++) {
      tableHead.push(score[i].quizName);
    }
    setHead(tableHead.slice());
    let stdidx = sID.indexOf(sID.find(e => e == thisStudent)); // get student //
    for (let i = 0; i < quizScore.length; i++) {
      tableData.push({studentID: sID[i], 
      studentName: students.find(e => e.id == sID[i]).fullname, 
      scores: quizScore[i]})
    }
    setTotalData(tableData.slice());
    setData([tableData[stdidx]].slice())
  }

  const [compareID, setCompare] = useState("---");
  function handleCompare(e: any) { setCompare(e.target.value) }
  useEffect(() => {
    if(tableData.length != 0) {
      if (compareID == "---" && tableData.length > 1) {
        let temp = [tableData[0]]; setData(temp.slice());
      }else{
        let temp = [tableData[0]];
        let stdidx = totalData.indexOf(totalData.find(e => e.studentID == compareID));
        temp.push(totalData[stdidx]);
        setData(temp.slice());
      }
    }
  }, [compareID])
  
  return (
    <div> 
      <span>Compare to</span>
      <select value={compareID} onChange={handleCompare} className="border rounded-md border-2 ">
        <option value="---">---</option>
        {totalData.map(std => (
          <option value={std.studentID}>{std.studentID}</option>
        ))}
      </select>
      <br/>
      <Table striped bordered hover className="table" style={{margin: 0, width: "60%"}}>
        <thead>
          <tr>
            {tableHead.map(head => (<th>{head}</th>))}
          </tr>
        </thead>
        <tbody>
          {tableData.map(data => (
            <tr>
              <td>{data.studentID}</td>
              <td>{data.studentName}</td>
              {data.scores.map(scores => (
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
