import { useEffect, useRef } from 'react';
import * as d3 from "d3";
import styled from 'styled-components';

export interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

export function ChartBarPLO(props: { data: studentResult, scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const scoreType = props.scoreType;
  const tableHead = props.tableHead;
  //Scoring
  interface averageScore { name: string, score: number }
  let datas = props.data;
  let avgScore: averageScore[] = [];
  for (let i = 0; i < datas.scores.length; i++){
    avgScore.push({name: tableHead[i], score: datas.scores[i] as number})
  }

  //Charting
  let dimensions = {
    w: 800, h: 380,
    margin: { top: 50, bottom: 50, left: 50, right: 50 }
  }
  let boxW = dimensions.w - dimensions.margin.left - dimensions.margin.right
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top

  useEffect(() => {
    if (avgScore.length != 0) {
      d3.selectAll("#chart1 > *").remove();
      const svgElement = d3.select(ref.current)
      let dataset = avgScore;
      //chart area
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 35)
        .style('text-anchor', 'middle').style('font-size', 18)
        .text(`Graph of ${scoreType} Score`)
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
        .attr("fill", "#3033d3")
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
          .style('top', e.pageY + 'px').style('left', e.pageX + 20 + 'px')
      }

      function mOutEvent() {
        d3.select(this).style('stroke-width', 0)
        d3.select(this).attr('fill', '#3033d3')
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display', 'none')
      }
    }
  }, [avgScore])

  return <div >
      <svg ref={ref} style={{ display: "block", margin: "auto" }} id="chart1"></svg>
      <Tooltip id='tooltip'>
        <div className='name'></div>
        <div className='score'></div>
      </Tooltip>
  </div>
}

export function ChartBarLO(props: { data: studentResult, scoreType: string, tableHead: string[] }) {
  const reff = useRef();
  const scoreType = props.scoreType;
  const tableHead = props.tableHead;
  //Scoring
  interface averageScore { name: string, score: number }
  let datas = props.data;
  let avgScore: averageScore[] = [];
  for (let i = 0; i < datas.scores.length; i++){
    avgScore.push({name: tableHead[i], score: datas.scores[i] as number})
  }
  //Charting
  let dimensions = {
    w: 550, h: 300,
    margin: { top: 50, bottom: 50, left: 50, right: 50 }
  }
  let boxW = dimensions.w - dimensions.margin.left - dimensions.margin.right
  let boxH = dimensions.h - dimensions.margin.bottom - dimensions.margin.top

  useEffect(() => {
    if (avgScore.length != 0) {
      d3.selectAll("#chart2 > *").remove();
      const svgElement = d3.select(reff.current)
      let dataset = avgScore;
      //chart area
      svgElement.attr('width', dimensions.w).attr('height', dimensions.h)
        .style("background-color", "transparent")
      svgElement.append('text')
        .attr('x', dimensions.w / 2).attr('y', 35)
        .style('text-anchor', 'middle').style('font-size', 18)
        .text(`Graph of ${scoreType} Score`)
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
        .attr("fill", "#0c7c1f")
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

      const tooltip = d3.select('#tooltip2')
      //event
      function mOverEvent(e: any, d: any) { //event, data
        d3.select(this).style('stroke-width', 2)
        d3.select(this).attr('fill', 'darkgreen')
        //tooltip
        tooltip.select('.name')
          .html(
            `<b>${d.name}</b> <br/> 
              Score ${d.score} `
          )
      }
      function mMoveEvent(e: any, d: any) {
        tooltip.style('display', 'block')
          .style('top', e.pageY + 'px').style('left', e.pageX+20 + 'px')
      }

      function mOutEvent() {
        d3.select(this).style('stroke-width', 0)
        d3.select(this).attr('fill', '#0c7c1f')
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display', 'none')
      }
    }
  }, [avgScore])

  return <div id="chartDiv">
      <svg ref={reff} style={{ display: "block", margin: "auto" }} id="chart2"></svg>
      <Tooltip id='tooltip2'>
        <div className='name'></div>
        <div className='score'></div>
      </Tooltip>
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
