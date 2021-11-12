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

export function AllStudentChart(props: { data: studentResult[], chartType: string, scoreType: string, tableHead: string[] }) {
  return (
    <div>
      {props.chartType === "avg" && <AverageChart data={props.data} scoreType={props.scoreType} tableHead={props.tableHead}/>}
      {props.chartType === "all" && <AllChart data={props.data} scoreType={props.scoreType} tableHead={props.tableHead}/>}
    </div>
  )
}

//Chart Selection
function AverageChart(props: { data: studentResult[], scoreType: string, tableHead: string[] }) {
  const [chartType, setChartType] = useState("bar");
  function handleChartType(e: any){ setChartType(e.target.value) }
  return(
    <div style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}>
      <div style={{ display: "inline" }}>
        <span style={{ marginRight: 5 }}>Graph Type</span>
        <select value={chartType} onChange={handleChartType} className="border rounded-md border-2 ">
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
      </div>
      {chartType === "bar" && <ChartBarAverage data={props.data} scoreType={props.scoreType} tableHead={props.tableHead}/>}
      {chartType === "pie" && <ChartPieAverage data={props.data} scoreType={props.scoreType} tableHead={props.tableHead}/>}
    </div>
  )
}

function AllChart(props: { data: studentResult[], scoreType: string, tableHead: string[] }) {
  const [chartType, setChartType] = useState("bar");
  function handleChartType(e: any){ setChartType(e.target.value) }
  return(
    <div style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}>
      <div style={{ display: "inline" }}>
        <span style={{ marginRight: 5 }}>Graph Type</span>
        <select value={chartType} onChange={handleChartType} className="border rounded-md border-2 ">
          <option value="bar">Bar Chart</option>
          <option value="bar2">Bar Scroll</option>
        </select>
      </div>
      {chartType === "bar" && <ChartBarAll data={props.data} scoreType={props.scoreType} tableHead={props.tableHead}/>}
      {chartType === "bar2" && <ChartBarAllScroll data={props.data} scoreType={props.scoreType} tableHead={props.tableHead}/>}
    </div>
  )
}


export function ChartBarAverage(props: { data: studentResult[], scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const scoreType = props.scoreType;
  const tableHead = props.tableHead;
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
    avgScore.push({ name: tableHead[i], score: avg[i] });
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
        .text(`Graph of Average ${scoreType} Score`)
      const box = svgElement.append('g')
        .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)

      //scale
      const xScale = d3.scaleBand()
        .range([0, boxW])
        .domain(tableHead)
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

      box.selectAll("rect")
        .data(dataset).enter().append('rect')
        .attr('width', xScale.bandwidth).attr('height', function (d) { return boxH - yScale(d.score); })
        .attr("x", function (d) { return xScale(d.name); })
        .attr("y", function (d) { return yScale(d.score); })
        .attr("fill", "#69b3a2")
        .style("stroke-width", "0px").style("stroke", "black")
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
        d3.select(this).style('stroke-width', 2)
        d3.select(this).attr('fill', 'darkblue')
        //tooltip
        tooltip.select('.name')
          .html(
            `<b>${d.name}</b> <br/> 
            Score ${d.score} `
          )
          
      }
      
      function mMoveEvent(e: any, d: any) {
        tooltip.style('display', 'block')
        .style('top', e.layerY +'px').style('left', e.layerX+20 +'px')
      }

      function mOutEvent() {
        d3.select(this).style('stroke-width', 0)
        d3.select(this).attr('fill', '#69b3a2')
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display', 'none')
      }
    }
  }, [avgScore])

  return <div >
    <div>
      <svg ref={ref}></svg>
      <Tooltip id='tooltip'>
          <div className='name'></div>
          <div className='score'></div>
        </Tooltip>
    </div>
  </div>
}


export function ChartBarAll(props: { data:studentResult[], scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const tableHead = props.tableHead;
  //scoring
  let datas = props.data;
  const scoreType = props.scoreType;
  let allScore = []; // all student score graph
  let allScoreTemp = [];
  for(var i in datas) {
    allScoreTemp.push({name: datas[i].studentID})
    for(var j in datas[i].scores) {
      allScoreTemp[i][tableHead[j]] = datas[i].scores[j]
    }
  }
  let subgroupTemp = []
  if(datas.length != 0){
    subgroupTemp = Array.from({length: datas[0].scores.length}, (d,i) => tableHead[i]);
  } 
  allScore = allScoreTemp.slice();
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
        .text(`Graph of Students' ${scoreType} Score`)
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
      
      const color = d3.scaleOrdinal<any>()
        .domain(subgroups)
        .range(d3.schemeSet1);

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
            .attr("fill", function(d) { return color(d.key); })
            .style('stroke-width', 0).style("stroke", "black")
            .style("opacity", 0.8)
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
        d3.select(this).style('opacity', 1)
        d3.select(this).style('stroke-width', 1)
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
        d3.select(this).style('opacity', 0.8)
        d3.select(this).style('stroke-width', 0)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display','none')
        tooltipMain.style('display','none')
      }
    }
  }, [allScore])

  return <div /*style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}*/>
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
}


export function ChartPieAverage(props: { data: studentResult[], scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const scoreType = props.scoreType;
  const tableHead = props.tableHead;
  const scoreDomain = [];
  let totalScore = 0;
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
    avgScore.push({ name: tableHead[i], score: avg[i] });
    totalScore += avg[i]
    scoreDomain.push(tableHead[i])
  }

  //Charting
  let dimensions = {
    w: 600, h: 400,
    margin:{ top: 50, bottom: 50, left: 50,right: 50 }
  }
  let boxW = dimensions.w - dimensions.margin.left - dimensions.margin.right
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top
  var radius = Math.min(dimensions.w, dimensions.h) / 2 - dimensions.margin.top

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
        .text(`Graph of Average ${scoreType} Score`)
      const box = svgElement.append('g')
        .attr('transform', `translate(${dimensions.margin.left+250}, ${dimensions.margin.top+150})`)

      //scale
      const color = d3.scaleOrdinal<any>()
        .domain(scoreDomain)
        .range(d3.schemeDark2);

      const pie = d3.pie<averageScore>()
        .value(function(d) {return d.score; })
      const data_ready = pie(dataset)
      
      const arc = d3.arc<any>()
        .innerRadius(radius * 0.4)        
        .outerRadius(radius * 0.8)
      const outerArc = d3.arc<any>()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)
      
      box.selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d) { return(color(d.data.name)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on('mouseover', mOverEvent)
        .on('mousemove', mMoveEvent)
        .on('mouseout', mOutEvent)

      box.selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline').transition()
          .attr("stroke", "black")
          .style("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', function(d) {
            const posA: any = arc.centroid(d)
            const posB: any = outerArc.centroid(d)
            const posC: any = outerArc.centroid(d);
            const midangle: any = d.startAngle + (d.endAngle - d.startAngle) / 2 
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC] as any
          })

        box.selectAll('allLabels')
          .data(data_ready)
          .enter()
          .append('text').transition() // score/total for %
            .text( function(d) { return `${d.data.name} (${((d.data.score*100/totalScore)).toFixed(0)} %)` } )
            .attr('transform', function(d) {
              var pos = outerArc.centroid(d);
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
              pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
              return 'translate(' + pos + ')';
            })
            .style('text-anchor', function(d) {
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
              return (midangle < Math.PI ? 'start' : 'end')
            })

      const tooltip = d3.select('#tooltip')
      //event
      function mOverEvent(e: any, d: any) { //event, data
        d3.select(this).attr("stroke-width", 10)
        .attr("stroke", "black")
        d3.select(this).style("opacity", 1)
        //tooltip
        tooltip.select('.name')
          .html(
            `<b>${d.data.name}</b> <br/> 
            Score ${d.data.score} `
          )
          
      }
      
      function mMoveEvent(e: any, d: any) {
        tooltip.style('display','block')
        .style('top', e.layerY +'px').style('left', e.layerX+20 +'px')
      }

      function mOutEvent() {
        d3.select(this).attr("stroke-width", 1)
        .attr("stroke", "white")
        d3.select(this).style("opacity", 1)
        tooltip.style('display','none')
      }
    }
  }, [avgScore])

  return <div>
    <svg ref={ref}>
    </svg>
    <Tooltip id='tooltip'>
      <div className='name'>A</div>
      <div className='score'></div>
    </Tooltip>
  </div>
}


//http://bl.ocks.org/cdagli/728e1f4509671b7de16d5f7f6bfee6f0
export function ChartBarAllScroll2(props: { data: studentResult[], scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const tableHead = props.tableHead;
  //scoring
  let datas = props.data;
  const scoreType = props.scoreType;
  let allScore = []; // all student score graph
  let allScoreTemp = [];
  for(var i in datas) {
    allScoreTemp.push({name: datas[i].studentID})
    for(var j in datas[i].scores) {
      allScoreTemp[i][tableHead[j]] = datas[i].scores[j]
    }
  }
  let subgroupTemp = []
  if(datas.length != 0){
    subgroupTemp = Array.from({length: datas[0].scores.length}, (d,i) => tableHead[i]);
  } 
  allScore = allScoreTemp.slice();
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
      const selectorHeight = 40;
      const heightOverview = 40;
      const maxLength = d3.max(dataset.map(function(d){ return d.name.length}))
      const barWidth = maxLength * 7;
      const numBars = Math.round(boxW/barWidth);
      const isScrollDisplayed = barWidth * dataset.length > boxW;
      
      //chart area
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 30)
        .style('text-anchor', 'middle').style('font-size', 20)
        .text(`Graph of Students' ${scoreType} Score Scrollable`)
      const box = svgElement.append('g')
        .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
      const diagram = svgElement.append("g")
        .attr("transform", "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");

      //scale
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
      
      const color = d3.scaleOrdinal<any>()
        .domain(subgroups)
        .range(d3.schemeSet1);

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
            .attr("fill", function(d) { return color(d.key); })
            .style('stroke-width', 0).style("stroke", "black")
            .style("opacity", 0.8)
            .on('mouseover', mOverEvent)
            .on('mousemove', mMoveEvent)
            .on('mouseout', mOutEvent)
            .transition()
      console.log("scroll display check", isScrollDisplayed)
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

      //Scroll
      const displayed = d3.scaleQuantize()
          .domain([0, boxW])
          .range(d3.range(dataset.length));

      if(isScrollDisplayed){
        const xOverview = d3.scaleBand()
          .domain(groups) .range([0, boxW]).padding(0.2);
        const yOverview = d3.scaleLinear().range([heightOverview, 0]);
        yOverview.domain(yScale.domain());
        const subBars = diagram.selectAll('.subBar').data(dataset);
        subBars.enter().append("rect").classed('subBar', true)
          .attr("height", d => heightOverview - yOverview(d.score))
          .attr("width", d => xOverview.bandwidth())
          .attr("x", d => xOverview(d.name))
          .attr("y", d => boxH + heightOverview + yOverview(d.score))

        diagram.append("rect")
          .attr("transform", "translate(0, " + (boxH + dimensions.margin.bottom) + ")")
          .attr("class", "mover")
          .attr("x", 0)
          .attr("y", 0)
          .attr("height", selectorHeight)
          .attr("width", Math.round((numBars * boxW)/dataset.length))
          .attr("pointer-events", "all")
          .attr("cursor", "ew-resize")
          .call(d3.drag().on("drag", display));
      }
      function display(e, d) {
        var x = parseInt(d3.select(this).attr("x")),
          nx = x + e.dx,
          w = parseInt(d3.select(this).attr("width")),
          f, nf, new_data, rects;

        if (nx < 0 || nx + w > boxW) return;

        d3.select(this).attr("x", nx);

        f = displayed(x);
        nf = displayed(nx);

        if (f === nf) return;

        new_data = dataset.slice(nf, nf + numBars);

        xScale.domain(new_data.map(function (d) { return d.name; }));
        const xAxis: any  = d3.axisBottom(xScale);
        diagram.select(".x.axis").call(xAxis);

        rects = box.selectAll("rect")
          .data(new_data, function (d: any) { return d.name; });

        rects.attr("x", function (d: any) { return xScale(d.name); });

        //rects.attr("transform", function(d) { return "translate(" + xscale(d.label) + ",0)"; })

        rects.enter().append("rect")
          .attr("class", "bar")
          .attr("x", function (d) { return xScale(d.name); })
          .attr("y", function (d) { return yScale(d.score); })
          .attr("width", xScale.bandwidth())
          .attr("height", function (d) { return boxH - yScale(d.score); });

        rects.exit().remove();
      };

      //event
      const tooltip = d3.select('#tooltip')
      const tooltipMain = d3.select('#tooltip2')
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
        d3.select(this).style('opacity', 1)
        d3.select(this).style('stroke-width', 1)
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
        d3.select(this).style('opacity', 0.8)
        d3.select(this).style('stroke-width', 0)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display','none')
        tooltipMain.style('display','none')
      }
    }
  }, [allScore])

  return <div /*style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}*/>
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
}

export function ChartBarAllScroll(props: { data: studentResult[], scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const tableHead = props.tableHead;
  //scoring
  let datas = props.data;
  const scoreType = props.scoreType;
  let allScore = []; // all student score graph
  let allScoreTemp = [];
  for(var i in datas) {
    allScoreTemp.push({name: datas[i].studentID})
    for(var j in datas[i].scores) {
      allScoreTemp[i][tableHead[j]] = datas[i].scores[j]
    }
  }
  let subgroupTemp = []
  if(datas.length != 0){
    subgroupTemp = Array.from({length: datas[0].scores.length}, (d,i) => tableHead[i]);
  } 
  allScore = allScoreTemp.slice();
  //Charting
  let dimensions = {
    w: 600, h: 400,
    margin:{ top: 50, bottom: 50, left: 50,right: 50 }
  }
  //boxW now in useEffect
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top
  useEffect(() => {
    if (allScore.length != 0) {
      d3.selectAll("svg > *").remove();
      const svgElement = d3.select(ref.current)
      let dataset = allScore;
      // dataset.push({name:"61130500999",PLO1:15,PLO2:20,PLO3:25,PLO4:30});
      // dataset.push({name:"61130501000",PLO1:15,PLO2:20,PLO3:25,PLO4:30});
      // dataset.push({name:"61130501001",PLO1:15,PLO2:20,PLO3:25,PLO4:30});
      //chart area
      let boxW = dataset.length*50 - dimensions.margin.left - dimensions.margin.right
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 30)
        .style('text-anchor', 'middle').style('font-size', 20)
        .text(`Graph of Students' ${scoreType} Score`)
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
      
      const color = d3.scaleOrdinal<any>()
        .domain(subgroups)
        .range(d3.schemeSet1);

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
            .attr("fill", function(d) { return color(d.key); })
            .style('stroke-width', 0).style("stroke", "black")
            .style("opacity", 0.8)
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
        console.log(e)
        tooltipMain.select('.name')
          .html(
            `<b>${d.name}</b> <br/> `
          )
      }
      function mMoveMain(e: any, d: any) {
        let scrolls = document.getElementById("chartDiv").scrollLeft; // check scroll length
        tooltipMain.style('display','block')
        .style('top', e.layerY-45 +'px').style('left', e.layerX+20-scrolls +'px')
      }
      function mOverEvent(e: any, d: any) { //event, data
        d3.select(this).style('opacity', 1)
        d3.select(this).style('stroke-width', 1)
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
        let scrolls = document.getElementById("chartDiv").scrollLeft; 
        tooltip.style('display','block')
        .style('top', e.layerY +'px').style('left', e.layerX+20-scrolls +'px')
      }
      function mOutEvent() {
        d3.select(this).style('opacity', 0.8)
        d3.select(this).style('stroke-width', 0)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display','none')
        tooltipMain.style('display','none')
      }
    }
  }, [allScore])

  return <div /*style={{position: "absolute", right: "1%", width: "40%", height: "60%", marginTop: "0.5%"}}*/>
    <div style={{"overflow":"scroll", "overflowY": "hidden"}} id="chartDiv">
      <svg ref={ref} style={{"width": datas.length * 50}} >
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
}

const Tooltip = styled.div`
  border: 1px solid #ccc;
  position: absolute;
  padding: 10px;
  background-color: #fff;
  display: none;
  pointer-events: none;
`;
