import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import ClientOnly from '../../../../../components/ClientOnly';
import * as d3 from "d3";
import styled from 'styled-components';

interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

interface averageScore {
  name: string, avgScore: number, stdScore: number
}

export function ChartBarCompare(props: { data: studentResult[], stdData: studentResult[], scoreType: string, tableHead: string[] }) {
  const ref = useRef();
  const scoreType = props.scoreType;
  const tableHead = props.tableHead;
  //scoring
  let stdDatas = props.stdData;
  let datas = props.data;
  let avgScoreTemp: averageScore[] = [];
  let dataLength = 0;
  for (var i in datas) {
    let ltemp = 0;
    for (var j in datas[i].scores) { ltemp += 1; }
    if (ltemp > dataLength) { dataLength = ltemp; }
  }
  let avg = Array.from({ length: dataLength }, () => 0);
  for (let i = 0; i < datas.length; i++) {
    for (let j = 0; j < datas[i].scores.length; j++) {
      let score = datas[i].scores[j] as number;
      if (!isNaN(score)) { // prevent nan
        avg[j] += score;
      }
    }
  }
  for (let i = 0; i < avg.length; i++) {
    avg[i] = parseInt((avg[i] / datas.length).toFixed(0))
    avgScoreTemp.push({ name: tableHead[i], avgScore: avg[i], stdScore: 20 });
  }
  if (stdDatas.length !== 0) {
    for (let i = 0; i < avgScoreTemp.length; i++) {
      avgScoreTemp[i]['stdScore'] = stdDatas[0].scores[i] as number;
    }
  }
  if (stdDatas.length == 2) { // add compare
    for (let i = 0; i < avgScoreTemp.length; i++) {
      avgScoreTemp[i]['compareScore'] = stdDatas[1].scores[i] as number;
    }
  }
  let avgScore = avgScoreTemp.slice();

  let subgroupTemp = []
  if (datas.length != 0) {
    if (stdDatas.length == 1) {
      subgroupTemp = (["stdScore", "avgScore"])
    }
    else {
      subgroupTemp = (["stdScore", "avgScore", "compareScore"])
    }

  }
  //charting
  let dimensions = {
    w: 600, h: 400,
    margin: { top: 50, bottom: 50, left: 50, right: 50 }
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
        .text(`Graph of ${scoreType} Score`)
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
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function (d, i) {
          return !(i % 1)
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
      var color = d3.scaleOrdinal<any>()
        .domain(subgroups)
        .range(['#2ace40', '#5299d3', '#347432'])

      var lab = d3.scaleLinear().interpolate(d3.interpolate).domain([0, 10, 21]);
      box.append("g")
        .selectAll("g")
        .data(dataset).enter()
        .append('g')
        .attr("transform", function (d) { return "translate(" + xScale(d.name) + ",0)"; })
        .on('mouseover', mOverMain)
        .on('mousemove', mMoveMain)
        .selectAll('rect')
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function (d) { return xSubGroup(d.key); })
        .attr("y", function (d) { return yScale(d.value); })
        .attr("width", xSubGroup.bandwidth())
        .attr("height", function (d) { return boxH - yScale(d.value); })
        .attr("fill", function (d) { return color(d.key); })
        .style('stroke-width', 0).style("stroke", "black")
        .style('opacity', 0.8)
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
        tooltipMain.style('display', 'block')
          .style('top', e.layerY - 45 + 'px').style('left', e.layerX + 20 + 'px')
      }

      function mOverEvent(e: any, d: any) { //event, data
        d3.select(this).style('opacity', 1)
        d3.select(this).style('stroke-width', 2)
        box.append('line')
          .attr('x1', 0).attr('y1', d3.select(this).attr('y'))
          .attr('x2', dimensions.w).attr('y2', d3.select(this).attr('y'))
          .style('stroke', 'black').classed('temp', true).style('opacity', '0.25')
        //tooltip
        let name = "Current Student Score";
        if (d.key == "avgScore") { name = "Average Class Score" }
        else if (d.key == "compareScore") { name = "Compared Student Score" }
        tooltip.select('.name')
          .html(
            `<b>${name}</b> <br/> 
              Score ${d.value} <br/>`
          )
      }

      function mMoveEvent(e: any, d: any) {
        tooltip.style('display', 'block')
          .style('top', e.layerY + 'px').style('left', e.layerX + 20 + 'px')
      }

      function mOutEvent() {
        d3.select(this).style('opacity', 0.8)
        d3.select(this).style('stroke-width', 0)
        d3.select('svg').selectAll('.temp').remove()
        tooltip.style('display', 'none')
        tooltipMain.style('display', 'none')
      }
    }
  }, [avgScore])

  return (<div style={{ position: "absolute", right: "1%", width: "40%", height: "50%", marginTop: "0.5%" }}>
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