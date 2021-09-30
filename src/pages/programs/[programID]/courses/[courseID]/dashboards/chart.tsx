// import React, { useState } from "react";
// import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar,Area, AreaChart, ComposedChart, Line, Tooltip } 
// from "recharts";

// interface chartdata{
//   name:string,score:number
// }

// export function Chart(props:any){
//     return(
//       <div>
//         {props.dataType === "plo" && <PloChart/>}
//         {props.dataType === "quiz" && <QuizChart/>}
//       </div>
//     );
// }

// function PloChart(props:any){
//   const data: Array<chartdata> = [{name: 'PLO1', score: 75}, {name: 'PLO2', score: 100}, {name: 'PLO3', score: 30},
//   {name: 'PLO4', score: 60}];
//   const [chartType,setType] = useState("TPLO");
//   function handleChange(e:any){setType(e.target.value)}
//   return(
//     <div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
//       <select value={chartType} style={{float: "right"}} onChange={handleChange}>
//         <option value="TPLO">Total PLO%</option>
//         <option value="TLO">Total LO%</option>
//         <option value="Test">Test Graph</option>
//       </select><br/>
//       {chartType === "TPLO" && <ChartBar dataArray={data}/>}
//       {chartType === "TLO" && <ChartLine/>}
//       {chartType === "Test" && <ChartTest/>}
//       </div>
//   )
// }

// function QuizChart(props: any) {
//   const data = [{name: 'Quiz1', score: 50}, {name: 'Quiz2', score: 10}, {name: 'Quiz3', score: 80},
//   {name: 'Quiz4', score: 30}, {name: 'Quiz5', score: 10}];
//   const [chartType, setType] = useState("Score");
//   function handleChange(e: any) { setType(e.target.value) }
//   return (
//     <div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
//       <select value={chartType} style={{float: "right"}} onChange={handleChange}>
//         <option value="Score">Score</option>
//         <option value="Average">Average Score</option>
//       </select><br />
//       {chartType === "Score" && <ChartBar dataArray={data}/>}
//       {chartType === "Average" && <ChartLine/>}
//     </div>
//   )
// }

// function ChartBar(props: { dataArray: Array<chartdata> }) {
//   return (
//     <ResponsiveContainer>
//       <BarChart data={props.dataArray} width={600} height={300}>
//         <CartesianGrid strokeDasharray="3 3"/>
//         <XAxis dataKey="name"/>
//         <YAxis type="number" domain={[0, 100]}/>
//         <Tooltip/>
//         <Legend/>
//         <Bar dataKey="score" fill="green"/>
//       </BarChart>
//     </ResponsiveContainer>
//   )
// }

// function ChartLine(props: any) {
//   const data = [{name: 'LO1', score: 25, min: 5}, {name: 'LO2', score: 50, min: 10}, {name: 'LO3', score: 40, min: 20},
//   {name: 'LO4', score: 10, min: 0}, {name: 'LO5', score: 20, min: 5}];
//   return (
//     <ResponsiveContainer>
//       <AreaChart data={data} width={600} height={300}>
//         <CartesianGrid strokeDasharray="3 3"/>
//         <XAxis dataKey="name"/>
//         <YAxis type="number" domain={[0, 100]}/>
//         <Tooltip/>
//         <Legend/>
//         <Area type="monotone" dataKey="score" fill="blue" fillOpacity={0.3}/>
//         <Area type="monotone" dataKey="min" name="min score" stroke="green" fill="lightgreen" fillOpacity={0.3}/>
//       </AreaChart>
//     </ResponsiveContainer>
//   )
// }

// function ChartTest(props:any){
//   const data = [{name: 'PLO1', score: 75},{name: 'PLO2', score: 100},{name: 'PLO3', score: 30},
//   {name: 'PLO4', score: 60}];
//   return(
//       <ResponsiveContainer>
//         <ComposedChart data={data} width={600} height={300}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name"/>
//           <YAxis/>
//           <Tooltip/>
//           <Legend/>
//           <Bar dataKey="score" fill="green"/>
//           <Line type="monotone" dataKey="score" fill="blue" strokeWidth={2}/>
//         </ComposedChart>
//       </ResponsiveContainer>
//   )
// }

