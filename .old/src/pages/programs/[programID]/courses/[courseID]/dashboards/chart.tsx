import React, { useState } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar,Area, AreaChart, ComposedChart, Line, Tooltip } 
from "recharts";
import { studentResult } from "./table";

interface chartdata{
  name: string, score: number
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

export function AllStudentChart(props: { data:studentResult[], chartType:string }) {
  return (
    <div>
      {props.chartType === "avg" && <ChartBarAverage data={props.data}/>}
      {props.chartType === "all" && <ChartBarAll data={props.data}/>}
    </div>
  )
}

export function ChartBarAll(props: { data:studentResult[] }) {
  let datas = props.data;
  let allScore = []; // all student score graph
  for(var i in datas) {
    allScore.push({name: datas[i].studentID})
    for(var j in datas[i].scores) {
      allScore[i][`score`+(parseInt(j)+1)] = datas[i].scores[j]
    }
  }

  return (<div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
    <h6 style={{float:"right"}}>Average Score Table</h6>
    <ResponsiveContainer>
      <BarChart data={allScore} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis type="number" domain={[0,100]}/>
        <Tooltip/>
         <Bar dataKey="score" fill="green"/> 
      </BarChart>
    </ResponsiveContainer>
  </div>
  )
}

export function ChartBarAverage(props: { data:studentResult[] }) {
  interface averageScore { name: string, score: number }
  let datas = props.data;
  let avgScore:averageScore[] = [];
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
    avg[i] = parseInt((avg[i] / datas.length).toFixed(0))
    avgScore.push({ name: 'Data' + (i + 1), score: avg[i] });
  }
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

interface averageScore {
  name: string, score: number, stdScore: number
}

export function ChartBarCompare(props: { data:studentResult[], stdData:studentResult[] }) {
  let stdDatas = props.stdData;
  let datas = props.data;
  let avgScore:averageScore[] = [];
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
    avgScore.push({ name: 'Data'+(i + 1), score: avg[i], stdScore: 20 });
  }
  if(stdDatas.length !== 0) {
    for (let i = 0; i < avgScore.length; i++) {
      avgScore[i]['stdScore'] = stdDatas[0].scores[i] as number;
    }
  }
  if(stdDatas.length == 2) { // add compare
    for (let i = 0; i < avgScore.length; i++) {
      avgScore[i]['compareScore'] = stdDatas[1].scores[i] as number;
    }
  }
  return (<div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
    <h6 style={{float:"right"}}>Student Score vs Average Score Table</h6>
    <ResponsiveContainer>
      <BarChart data={avgScore} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis type="number" domain={[0,100]}/>
        <Tooltip/>
        {/* <Legend/> */}
        <Bar dataKey="stdScore" fill="green" name="Student Score"/>
        {stdDatas.length == 2 && <Bar dataKey="compareScore" fill="darkgreen" name="Compared student score"/>}
        <Bar dataKey="score" fill="blue" name="Class average score"/>
        
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
