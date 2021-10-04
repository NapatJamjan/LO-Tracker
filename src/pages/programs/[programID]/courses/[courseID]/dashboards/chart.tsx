import React, { useState } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar,Area, AreaChart, ComposedChart, Line, Tooltip } 
from "recharts";
import { studentResult } from "./table";

interface chartdata{
  name: string, score: number
}

export function Chart(props:any) {
    return(
      <div>
        {props.dataType === "plo" && <PloChart/>}
        {props.dataType === "quiz" && <QuizChart/>}
      </div>
    );
}

export function Charts(props:any) {
  return (
    <div>
      {props.chartType === "bar" && <ChartBar dataArray={props.data}/>}
      {props.chartType === "line" && <ChartLine dataArray={props.data}/>}
      {props.chartType === "mix" && <ChartMix dataArray={props.data}/>}
    </div>
  )
}

function PloChart(props:any){
  const data: Array<chartdata> = [{name: 'PLO1', score: 75}, {name: 'PLO2', score: 100}, {name: 'PLO3', score: 30},
  {name: 'PLO4', score: 60}];
  const [chartType,setType] = useState("TPLO");
  function handleChange(e:any){setType(e.target.value)}
  return(
    <div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
      <select value={chartType} style={{float: "right"}} onChange={handleChange}>
        <option value="TPLO">Total PLO%</option>
        <option value="TLO">Total LO%</option>
        <option value="Test">Test Graph</option>
      </select><br/>
      {chartType === "TPLO" && <ChartBar dataArray={data}/>}
      {chartType === "TLO" && <ChartLine/>}
      {chartType === "Test" && <ChartMix/>}
      </div>
  )
}

function QuizChart(props: any) {
  const data = [{name: 'Quiz1', score: 50}, {name: 'Quiz2', score: 10}, {name: 'Quiz3', score: 80},
  {name: 'Quiz4', score: 30}, {name: 'Quiz5', score: 10}];
  const [chartType, setType] = useState("Score");
  function handleChange(e: any) { setType(e.target.value) }
  return (
    <div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
      <select value={chartType} style={{float: "right"}} onChange={handleChange}>
        <option value="Score">Score</option>
        <option value="Average">Average Score</option>
      </select><br/>
      {chartType === "Score" && <ChartBar dataArray={data}/>}
      {chartType === "Average" && <ChartLine/>}
    </div>
  )
}

export function ChartBarr(props: { data:studentResult[] }) {
  let datas = props.data;
  let lengthh=0;
  let newData = datas.map((val, index) => {
    let ltemp = 0;
    let mapFormat = new Map<string, Number>();
    mapFormat.set('studentID', parseInt(val.studentID));
    for(let i = 0; i < val.scores.length; ++i) {
      ltemp+=1;
      mapFormat.set(`score${i+1}`, val.scores[i]);
    }
    if(ltemp > lengthh) {lengthh = ltemp}
    return mapFormat;
  });
  console.log('lll', lengthh);
  let dataMapArr = Array.from({length:lengthh}, () => 0);
  // console.log("new Data",newData)
  //take2
  const dat = datas.map(v => ({studentID: v.studentID, 
    score1: v.scores[0]
  }))
  let bbb = 'h';
  const h = {a: '1', b: '1',bbb, $a:'2'}
  console.log(h)
  console.log("data take2",dat)
  let cnt = 0;
  let getVal = (x) => {
    console.log('getVal',cnt)
    cnt = cnt+1;
    if(cnt == lengthh){
      cnt = 0;
    }
    return x.scores[cnt];
  }
  return (<div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
    <ResponsiveContainer>
      <BarChart data={datas} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="studentID"/>
        <YAxis type="number" domain={[0,100]}/>
        <Tooltip/>
        <Legend/>
          {dataMapArr.map((v,i) => (
            <Bar dataKey={getVal} fill="green"/>
          ))}

      </BarChart>
    </ResponsiveContainer>
  </div>
  )
}

export function ChartBarr2(props: { data:studentResult[] }) {
  interface averageScore {
    name: string, score: number
  }
  let datas = props.data;
  let avgScore:averageScore[] = [];
  console.log(datas)
  let dataLength=0;
  for(var i in datas) { 
    let ltemp = 0;
    for (var j in datas[i].scores) { ltemp +=1; } 
      if(ltemp > dataLength) { dataLength = ltemp;}
  }
  let avg = Array.from({length: dataLength}, () => 0);
  for (let i = 0; i < datas.length; i++) { 
    for (let j = 0; j < datas[i].scores.length; j++) {
      let score = datas[i].scores[j] as number;
      if(!isNaN(score)){ // prevent nan
        avg[j] += score;
      }
    }
  }
  for (let i = 0; i < avg.length; i++) {
    avg[i] = parseInt((avg[i]/datas.length).toFixed(0))
    avgScore.push({name:'Data'+(i+1),score:avg[i]});
  }
  console.log("avaged", avgScore);
  return (<div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
    <h6 style={{float:"right"}}>Average Score Table</h6>
    <ResponsiveContainer>
      <BarChart data={avgScore} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis type="number" domain={[0,100]}/>
        <Tooltip/>
        {/* <Legend/> */}
        <Bar dataKey="score" fill="green"/>
      </BarChart>
    </ResponsiveContainer>
  </div>
  )
}

function ChartBar(props: { dataArray: Array<chartdata> }) {
  return (
    <ResponsiveContainer>
      <BarChart data={props.dataArray} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis type="number" domain={[0, 100]}/>
        <Tooltip/>
        <Legend/>
        <Bar dataKey="score" fill="green"/>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ChartLine(props: any) {
  const data = [{name: 'LO1', score: 25, min: 5}, {name: 'LO2', score: 50, min: 10}, {name: 'LO3', score: 40, min: 20},
  {name: 'LO4', score: 10, min: 0}, {name: 'LO5', score: 20, min: 5}];
  return (
    <ResponsiveContainer>
      <AreaChart data={data} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis type="number" domain={[0, 100]}/>
        <Tooltip/>
        <Legend/>
        <Area type="monotone" dataKey="score" fill="blue" fillOpacity={0.3}/>
        <Area type="monotone" dataKey="min" name="min score" stroke="green" fill="lightgreen" fillOpacity={0.3}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ChartMix(props:any){
  const data = [{name: 'PLO1', score: 75},{name: 'PLO2', score: 100},{name: 'PLO3', score: 30},
  {name: 'PLO4', score: 60}];
  return(
      <ResponsiveContainer>
        <ComposedChart data={data} width={600} height={300}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name"/>
          <YAxis/>
          <Tooltip/>
          <Legend/>
          <Bar dataKey="score" fill="green"/>
          <Line type="monotone" dataKey="score" fill="blue" strokeWidth={2}/>
        </ComposedChart>
      </ResponsiveContainer>
  )
}
