import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import ClientOnly from '../../../../components/ClientOnly';
import * as d3 from "d3";
import styled from 'styled-components';

export interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

// path => /course/[id]/dashboards/chart
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly> 
      <ChartPage/> 
    </ClientOnly>
  </div>);
};

function ChartPage() {
  const router = useRouter();
  const {id: courseID} = router.query; // extract id from router.query and rename to courseID
  return <div> Hello {courseID} </div>;
};

export function AllStudentChart(props: { data: studentResult[], chartType: string, scoreType: string }) {
  return (
    <div>
      {props.chartType === "avg" && <ChartBarAverage data={props.data} scoreType={props.scoreType}/>}
      {props.chartType === "all" && <ChartBarAll data={props.data} scoreType={props.scoreType}/>}
    </div>
  )
}

export function ChartBarAverage(props: { data: studentResult[], scoreType: string }) {
  const ref = useRef();
  const scoreType = props.scoreType;
  //Scoring
  interface averageScore { name: string, score: number }
  let datas = props.data; let dataLength = 0;
  let avgScore: averageScore[] = [];
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
    avgScore.push({ name: scoreType + (i + 1), score: avg[i] });
  }

  //Charting
  let dimensions = {
    w: 600, h: 400,
    margin:{ top: 50, bottom: 50, left: 50,right: 50 }
  }
  let boxW = dimensions.w - dimensions.margin.left - dimensions.margin.right
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top

  useEffect(() => {
    if (avgScore.length != 0) {
      d3.selectAll("svg > *").remove();
      const svgElement = d3.select(ref.current)
      let dataset = avgScore;
      //chart area
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 30)
        .style('text-anchor', 'middle').style('font-size', 20)
        .text("Graph of Average Quiz Score")
      const box = svgElement.append('g')
        .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)

      //scale
      const xScale = d3.scaleBand()
        .range([0, boxW])
        .domain(dataset.map(function (d) { return d.name; }))
        .padding(0.2);
      box.append("g").transition()
        .attr("transform", "translate(0," + boxH + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text").style("text-anchor", "middle");
      const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([boxH, 0]);
      box.append("g").transition()
        .call(d3.axisLeft(yScale));

      const xAccessor = d => d.name
      const yAccessor = d => d.score

      box.selectAll("rect") // can use in svg instead
        .data(dataset).enter().append('rect')
        .attr('width', xScale.bandwidth).attr('height', function (d) { return boxH - yScale(d.score); })
        .attr("x", function (d) { return xScale(d.name); })
        .attr("y", function (d) { return yScale(d.score); })
        .attr("fill", "#69b3a2")
        .on('mouseover', mOverEvent)
        .on('mousemove', mMoveEvent)
        .on('mouseout', mOutEvent)
        .transition()

      //Axis
      const xAxisGroup = box.append("g").style('transform', `translateY(${boxH}px)`)
      const yAxisGroup = box.append("g")
      xAxisGroup.append('text')
        .attr('x', boxW / 2)
        .attr('y', dimensions.margin.bottom - 10)
        .attr('fill', 'black')
        .text(scoreType)
        .style('text-anchor', 'middle')
      yAxisGroup.append('text')
        .attr('x', -boxH / 2)
        .attr('y', -dimensions.margin.left + 15) // have - when you rotate
        .attr('fill', 'black')
        .text('Score')
        .style('transform', 'rotate(270deg)')
        .style('text-anchor', 'middle')

      const tooltip = d3.select('#tooltip')
      //event
      function mOverEvent(e: any, d: any) { //event, data
        let thisCx = d3.select(this).attr('x')
        let thisCy = d3.select(this).attr('y')
        d3.select(this)
          .attr('fill', 'darkblue').attr('r', 7.5)
        //tooltip
        tooltip.select('.name')
          .html(
            `<b>${d.name}</b> <br/> 
            Score ${d.score} `
          )
          
      }
      
      function mMoveEvent(e: any, d: any) {
        tooltip.style('display','block')
        .style('top', e.layerY +'px').style('left', e.layerX+20 +'px')
      }

      function mOutEvent() {
        d3.select(this)
          .attr('fill', '#69b3a2').attr('r', 5)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display','none')
      }
    }
  }, [avgScore])

  return <div style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}>
    <div>
      <svg ref={ref}>
        
      </svg>
      <Tooltip id='tooltip'>
          <div className='name'>A</div>
          <div className='score'></div>
        </Tooltip>
    </div>
  </div>
}



export function ChartBarAll(props: { data:studentResult[], scoreType: string }) {
  const ref = useRef();
  //scoring
  let datas = props.data;
  const scoreType = props.scoreType;
  let allScore = []; // all student score graph
  let allScoreTemp = [];
  for(var i in datas) {
    allScoreTemp.push({name: datas[i].studentID})
    for(var j in datas[i].scores) {
      allScoreTemp[i][scoreType+(parseInt(j)+1)] = datas[i].scores[j]
    }
  }
  let subgroupTemp = []
  if(datas.length != 0){
    subgroupTemp = Array.from({length: datas[0].scores.length}, (d,i) => scoreType+(i+1));
  } 
  allScore = allScoreTemp.slice();
  let scoreBar = []; // for bar mapping
  if(datas.length != 0){scoreBar = Array.from({length: datas[0].scores.length}, () => "green");} // graph color
  scoreBar[0] = "darkgreen";
  //Charting
  let dimensions = {
    w: 600, h: 400,
    margin:{ top: 50, bottom: 50, left: 50,right: 50 }
  }
  let boxW = dimensions.w - dimensions.margin.left - dimensions.margin.right
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top

  useEffect(() => {
    if (allScore.length != 0) {
      d3.selectAll("svg > *").remove();
      const svgElement = d3.select(ref.current)
      let dataset = allScore;
      //chart area
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 30)
        .style('text-anchor', 'middle').style('font-size', 20)
        .text("Graph of Average Quiz Score")
      const box = svgElement.append('g')
        .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)

      //scale
      // var groups = d3.map(dataset, function(d){return(d.studentName)}).keys()
      var groups = allScore.map(d => d.name);
      var subgroups = subgroupTemp.slice();
      const xScale = d3.scaleBand()
        .domain(groups)
        .range([0, boxW])
        .padding(0.2);
      box.append("g").transition()
        .attr("transform", "translate(0," + boxH + ")")
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ 
          if(allScore.length >= 15){
            return !(i%4)
          }else{
            return !(i%2)
          }
          
      })))
        .selectAll("text").style("text-anchor", "middle")
        // .attr("transform", "translate(-25,15)rotate(-45)")
      const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([boxH, 0]);
      box.append("g").transition()
        .call(d3.axisLeft(yScale));
      const xSubGroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, xScale.bandwidth()])
        .padding(0.05)
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c','#377eb8','#4daf4a'])

      box.append("g")
        .selectAll("g") // can use in svg instead
        .data(dataset).enter()
        .append('g')
          .attr("transform", function(d) { return "translate(" + xScale(d.name) + ",0)"; })
          .on('mouseover', mOverMain)
          .on('mousemove', mMoveMain)
          .selectAll('rect')
          .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
          .enter().append("rect")
            .attr("x", function(d) { return xSubGroup(d.key); })
            .attr("y", function(d) { return yScale(d.value); })
            .attr("width", xSubGroup.bandwidth())
            .attr("height", function(d) { return boxH - yScale(d.value); })
            .attr("fill", "green")
            .on('mouseover', mOverEvent)
            .on('mousemove', mMoveEvent)
            .on('mouseout', mOutEvent)
            .transition()

      //Axis
      const xAxisGroup = box.append("g").style('transform', `translateY(${boxH}px)`)
      const yAxisGroup = box.append("g")
      xAxisGroup.append('text')
        .attr('x', boxW / 2)
        .attr('y', dimensions.margin.bottom - 10)
        .attr('fill', 'black')
        .text(scoreType)
        .style('text-anchor', 'middle')
        .transition()
      yAxisGroup.append('text')
        .attr('x', -boxH / 2)
        .attr('y', -dimensions.margin.left + 15) // have - when you rotate
        .attr('fill', 'black')
        .text('Score')
        .style('transform', 'rotate(270deg)')
        .style('text-anchor', 'middle')
        .transition()

      const tooltip = d3.select('#tooltip')
      const tooltipMain = d3.select('#tooltip2')
      
      //event
      function mOverMain(e: any, d: any) {
        tooltipMain.select('.name')
          .html(
            `<b>${d.name}</b> <br/> `
          )
      }
      function mMoveMain(e: any, d: any) {
        tooltipMain.style('display','block')
        .style('top', e.layerY-45 +'px').style('left', e.layerX+20 +'px')
      }
      function mOverEvent(e: any, d: any) { //event, data
        d3.select(this)
          .attr('fill', 'darkblue').attr('r', 7.5)
          box.append('line')
          .attr('x1', 0).attr('y1', d3.select(this).attr('y'))
          .attr('x2', dimensions.w).attr('y2', d3.select(this).attr('y'))
          .style('stroke', 'black').classed('temp', true).style('opacity', '0.25')
        //tooltip
        tooltip.select('.name')
          .html(
            `<b>${d.key}</b> <br/> 
            Score ${d.value} <br/>`
          )
      }

      function mMoveEvent(e: any, d: any) {
        tooltip.style('display','block')
        .style('top', e.layerY +'px').style('left', e.layerX+20 +'px')
      }

      function mOutEvent() {
        d3.select(this)
          .attr('fill', 'green').attr('r', 5)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display','none')
        tooltipMain.style('display','none')
      }
    }
  }, [allScore])

  return <div style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}>
    <div>
      <svg ref={ref}>
        
      </svg>
      <Tooltip id='tooltip'>
        <div className='name'>A</div>
        <div className='score'></div>
      </Tooltip>
      <Tooltip id='tooltip2'>
        <div className='name'>A</div>
      </Tooltip>
    </div>
  </div>
}



interface averageScore {
  name: string, avgScore: number, stdScore: number
}

export function ChartBarCompare(props: { data: studentResult[], stdData: studentResult[], scoreType: string }) {
  const ref = useRef();
  const scoreType = props.scoreType;
  //scoring
  let stdDatas = props.stdData;
  let datas = props.data;
  let avgScoreTemp: averageScore[] = [];
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
    avgScoreTemp.push({ name: props.scoreType+(i + 1), avgScore: avg[i], stdScore: 20 });
  }
  if(stdDatas.length !== 0) {
    for (let i = 0; i < avgScoreTemp.length; i++) {
      avgScoreTemp[i]['stdScore'] = stdDatas[0].scores[i] as number;
    }
  }
  if(stdDatas.length == 2) { // add compare
    for (let i = 0; i < avgScoreTemp.length; i++) {
      avgScoreTemp[i]['compareScore'] = stdDatas[1].scores[i] as number;
    }
  }
  let avgScore = avgScoreTemp.slice();

  let subgroupTemp = []
  if(datas.length != 0){
    if(stdDatas.length == 1){
      subgroupTemp = (["stdScore", "avgScore"])
    }
    else{
      subgroupTemp = (["stdScore", "avgScore", "compareScore"])
    }
    
  } 
  //charting
  let dimensions = {
    w: 600, h: 400,
    margin:{ top: 50, bottom: 50, left: 50,right: 50 }
  }
  let boxW = dimensions.w - dimensions.margin.left - dimensions.margin.right
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top

  useEffect(() => {
    if (avgScore.length != 0) {
      d3.selectAll("svg > *").remove();
      const svgElement = d3.select(ref.current)
      let dataset = avgScore;
      //chart area
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 30)
        .style('text-anchor', 'middle').style('font-size', 20)
        .text("Graph of Average Quiz Score")
      const box = svgElement.append('g')
        .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)

      //scale
      // var groups = d3.map(dataset, function(d){return(d.studentName)}).keys()
      var groups = avgScore.map(d => d.name);
      var subgroups = subgroupTemp.slice();
      const xScale = d3.scaleBand()
        .domain(groups)
        .range([0, boxW])
        .padding(0.2);
      box.append("g")
        .attr("transform", "translate(0," + boxH + ")")
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ 
          return !(i%1)
      })))
        .selectAll("text").style("text-anchor", "middle")
        // .attr("transform", "translate(-25,15)rotate(-45)")
      const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([boxH, 0]);
      box.append("g")
        .call(d3.axisLeft(yScale));
      const xSubGroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, xScale.bandwidth()])
        .padding(0.05)
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c','#377eb8','#4daf4a'])

      var lab = d3.scaleLinear().interpolate(d3.interpolate).domain([0, 10, 21]);
      box.append("g")
        .selectAll("g") // can use in svg instead
        .data(dataset).enter()
        .append('g')
          .attr("transform", function(d) { return "translate(" + xScale(d.name) + ",0)"; })
          .on('mouseover', mOverMain)
          .on('mousemove', mMoveMain)
          .selectAll('rect')
          .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
          .enter().append("rect")
            .attr("x", function(d) { return xSubGroup(d.key); })
            .attr("y", function(d) { return yScale(d.value); })
            .attr("width", xSubGroup.bandwidth())
            .attr("height", function(d) { return boxH - yScale(d.value); })
            .attr("fill", "green")
            .on('mouseover', mOverEvent)
            .on('mousemove', mMoveEvent)
            .on('mouseout', mOutEvent)
            .transition()

      //Axis
      const xAxisGroup = box.append("g").style('transform', `translateY(${boxH}px)`)
      const yAxisGroup = box.append("g")
      xAxisGroup.append('text')
        .attr('x', boxW / 2)
        .attr('y', dimensions.margin.bottom - 10)
        .attr('fill', 'black')
        .text(scoreType)
        .style('text-anchor', 'middle')
        .transition()
      yAxisGroup.append('text')
        .attr('x', -boxH / 2)
        .attr('y', -dimensions.margin.left + 15) // have - when you rotate
        .attr('fill', 'black')
        .text('Score')
        .style('transform', 'rotate(270deg)')
        .style('text-anchor', 'middle')
        .transition()

      const tooltip = d3.select('#tooltip')
      const tooltipMain = d3.select('#tooltip2')
      
      //event
      function mOverMain(e: any, d: any) {
        tooltipMain.select('.name')
          .html(
            `<b>${d.name}</b> `
          )
      }
      function mMoveMain(e: any, d: any) {
        tooltipMain.style('display','block')
        .style('top', e.layerY-45 +'px').style('left', e.layerX+20 +'px')
      }

      function mOverEvent(e: any, d: any) { //event, data
        d3.select(this)
          .attr('fill', 'darkblue').attr('r', 7.5)
          box.append('line')
          .attr('x1', 0).attr('y1', d3.select(this).attr('y'))
          .attr('x2', dimensions.w).attr('y2', d3.select(this).attr('y'))
          .style('stroke', 'black').classed('temp', true).style('opacity', '0.25')
        //tooltip
        let name="Current Student Score";
        if(d.key == "avgScore") { name = "Average Class Score" }
        else if(d.key == "compareScore") { name = "Compared Student Score"}
        tooltip.select('.name')
          .html(
            `<b>${name}</b> <br/> 
            Score ${d.value} <br/>`
          )
      }

      function mMoveEvent(e: any, d: any) {
        tooltip.style('display','block')
        .style('top', e.layerY +'px').style('left', e.layerX+20 +'px')
      }

      function mOutEvent() {
        d3.select(this)
          .attr('fill', 'green').attr('r', 5)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display','none')
        tooltipMain.style('display','none')
      }
    }
  }, [avgScore])

  return (<div style={{position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%"}}>
    <div>
      <svg ref={ref}>
      </svg>
      <Tooltip id='tooltip'>
        <div className='name'></div>
        <div className='score'></div>
      </Tooltip>
      <Tooltip id='tooltip2'>
        <div className='name'></div>
      </Tooltip>
    </div>
  </div>
  )
}


const Tooltip = styled.div`
  border: 1px solid #ccc;
  position: absolute;
  padding: 10px;
  background-color: #fff;
  display: none;
  pointer-events: none;
`;
