import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import styled from 'styled-components';
import Head from 'next/head';
import { gql } from '@apollo/client';
import client from '../../apollo-client';
import router from 'next/router';
import { OverlayTrigger, Table, Tooltip} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ChartBarPLO } from '../../components/dashboards/plochart';
import { getSession, useSession } from 'next-auth/react';

export default function Page({student, dashboard}: {student: StudentModel, dashboard: IndividualDashboard}) {
  const {data: session, status} = useSession();
  const [ploDataType, setPLOType] = useState("loading");
  function handleType(e: any) { setPLOType(e.target.value) }
  const [tableHead, setHead] = useState<string[]>([])
  const [chartData, setChart] = useState<studentResult>({studentID: student.id, studentName: student.name, scores: []});
  let tempHead = ['Student ID', 'Student Name'];
  const [tableData, setData] = useState([]);
  let plos = dashboard.ploGroups.slice();
  plos.sort((a: any, b: any) => {
    if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
    if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
  })
  console.log("d", dashboard)
  // tableData.scores = Array.from({length: MockCount}, () => Math.floor(Math.random() * 90 + 10))
  if(plos.length != 0 && ploDataType == "loading"){
    setPLOType(plos[0].name);
  }
  useEffect(() => {
    let targetPLOs = plos.find(e => e.name == ploDataType)
    targetPLOs.plos.sort((a: any, b: any) => {
      if(a.title.toLowerCase() < b.title.toLowerCase()) return -1;
      if(a.title.toLowerCase() > b.title.toLowerCase()) return 1;
      return 0;
    })
    setData(targetPLOs.plos.slice());
    chartData.scores = []
    tempHead = ['Student ID', 'Student Name']
    for (let i = 0; i < targetPLOs.plos.length; i++) {
      tempHead.push(targetPLOs.plos[i].title);
      chartData.scores.push(parseInt((targetPLOs.plos[i].percentage * 100 as number).toFixed(0)));
    }
    setChart(chartData);
    setHead(tempHead.slice());
    
  }, [ploDataType])

  if (status === 'loading') return null;
  const noPermission = !session.isTeacher && String(session.id) !== student.id;
  if (noPermission) return <p className="text-center">No permission</p>;

  return <div>
    <Head>
      <title>{student.name}'s Dashboard</title>
    </Head>
    <div>
      <p style={{fontSize: 20}}>Program Learning Outcome Dashboard</p>
      <div>
      <BackButton onClick={() => {
        if(session.isTeacher) router.back();
        else router.replace('/');
        }}>
        &#12296;Back
      </BackButton>
      <h6>ID: {student.id}</h6>
      <h6>Email: {student.email}</h6>
      <h6>Name: {student.name} {student.surname}</h6>
      </div><br/>
      <span>Select PLO Group to view: </span>
      <select value={ploDataType} onChange={handleType} className="border rounded-md border-2 ">
        {/* <option value="plo">Program Learning Outcome</option> */}
        {plos.map((d, i) =>  (
          <option key={`ploset`+i} value={d.name}>{d.name}</option>
        ))}
      </select>
      <TableScrollDiv>
        <TableScrollable striped bordered hover className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              {tableHead.map((head, i) => (<th>{head}{i > 1 && <span> (%)</span>}</th>))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{student.id}</td>
              <td>{student.name} {student.surname}</td>
              {tableData.map(scores => (
                <td>{(scores.percentage * 100 as number).toFixed(0)}</td>
              ))}
            </tr>
          </tbody>
        </TableScrollable>
      </TableScrollDiv>
      <ChartBarPLO data={chartData} scoreType={"Program Learning Outcome"} tableHead={tableHead.slice(2)}/>
    </div>
    <div>
    <p style={{fontSize: 20}}>Learning Outcome Dashboard</p>
    <LODashboard student={student} dashboard = {dashboard}/>
    </div>
  </div>;
}

function LODashboard({student, dashboard}: {student: StudentModel, dashboard: IndividualDashboard}){
  const [course, setCourse] = useState("loading");
  function handleType(e: any) { setCourse(e.target.value) }
  const [tableHead, setHead] = useState<string[]>([])
  const [chartData, setChart] = useState<studentResult>({studentID: student.id, studentName: student.name, scores: []});
  let tempHead = ['Student ID', 'Student Name'];
  const [tableData, setData] = useState([]);
  const [quizData, setQuiz] = useState([]);
  let courses = dashboard.courses.slice();
  courses.sort((a: any, b: any) => {
    if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
    if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
  })
  console.log("d", dashboard)

  if(dashboard.ploGroups.length != 0 && course == "loading"){
    setCourse(courses[0].name);
  }
  useEffect(() => {
    let targetCourse = courses.find(e => e.name == course)
    targetCourse.los.sort((a: any, b: any) => {
      if(a.title.toLowerCase() < b.title.toLowerCase()) return -1;
      if(a.title.toLowerCase() > b.title.toLowerCase()) return 1;
      return 0;
    })
    for (let i = 0; i < targetCourse.los.length; i++) {
      targetCourse.los[i].levels.sort((a: any, b: any) => {
        if(a.level< b.level) return -1;
        if(a.level > b.level) return 1;
        return 0;
      })
    }
    setData(targetCourse.los.slice());
    setQuiz(targetCourse.quizzes.slice());
    chartData.scores = []
    tempHead = ['Student ID', 'Student Name']
    for (let i = 0; i < targetCourse.los.length; i++) {
      tempHead.push(targetCourse.los[i].title);
      chartData.scores.push(parseInt((targetCourse.los[i].percentage * 100 as number).toFixed(0)));
    }
    setChart(chartData);
    setHead(tempHead.slice());
    
  }, [course])
  return(
    <div>
      <span>Select Course: </span>
      <select value={course} onChange={handleType} className="border rounded-md border-2 ">
        {courses.map((d, i) =>  (
          <option key={`ploset`+i} value={d.name}>{d.name}</option>
        ))}
      </select>
      <TableScrollDiv>
        <TableScrollable striped bordered hover className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>student Name</th>
              {tableData.map((data, i) => (<OverlayTrigger
                placement="right"overlay={
                  <Tooltip id={`tooltip${i}`}>
                    <b>LO Levels</b>
                    {data.levels.map(lvl => ( 
                    <p>{lvl.description}</p>
                    ))}
                  </Tooltip>
                }><th>
                {data.title}{i > 1 && <span> (%)</span>}</th></OverlayTrigger>))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{student.id}</td>
              <td>{student.name} {student.surname}</td>
              {tableData.map(scores => (
                <td>{(scores.percentage * 100 as number).toFixed(0)}</td>
              ))}
            </tr>
          </tbody>
        </TableScrollable>
      </TableScrollDiv>
      {quizData.map(d => (
        <div>
          <p>{d.name} : {d.studentScore} / {d.maxScore}</p>
          <p>Linked to {d.los.length} LO levels</p>
        </div>
      ))}
    </div>
  )
 
}

const OverlayText = (props) => (
  <Tooltip id="button-tooltip">
    {props.text}
  </Tooltip>
);

interface PageParams extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{student: StudentModel, dashboard: IndividualDashboard}> = async (context) => {
  const { id: studentID } = context.params as PageParams;
  const data = await Promise.all([
    client.query<{student: StudentModel}, {studentID: string}>({
      query: GET_STUDENT, variables: { studentID }
    }),
    client.query<{individualSummary: IndividualDashboard}, {studentID: string}>({
      query: GET_DASHBOARD, variables: { studentID }
    })
  ]);
  console.log(data[1].data.individualSummary)
  return {
    props: {
      student: data[0].data.student,
      dashboard: data[1].data.individualSummary
    },
    revalidate: 30,
  };
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  const { data } = await client.query<{students: StudentModel[]}>({
    query: GET_STUDENTS
  });
  return {
    paths: data.students.map((student) => ({
      params: {id: student.id}
    })),
    fallback: 'blocking',
  };
};

interface StudentModel {
  id: string;
  email: string;
  name: string;
  surname: string;
};

const GET_STUDENT = gql`
  query Student($studentID: ID!) {
    student(studentID: $studentID) {
      id
      email
      name
      surname
}}`;

const GET_STUDENTS = gql`
  query Students {
    students {
      id
}}`;

const GET_DASHBOARD = gql`
  query IndividualSummary($studentID: ID!) {
    individualSummary(studentID: $studentID) {
      ploGroups {
        name
        plos {
          title
          percentage
        }
      }
      courses {
        name
        semester
        year
        los {
          id
          title
          percentage
          levels {
            level
            description
          }
        }
        quizzes {
          id
          name
          maxScore
          studentScore
          los
        }
      }
}}`;

interface IndividualDashboard {
  ploGroups: {
    name: string;
    plos: {
      title: string;
      percentage: number;//0-1
    }[];
  }[];
  courses: {
    name: string;
    semester: number;
    year: number;
    los: {
      id: string;
      title: string;
      percentage: number;//0-1
      levels: {
        level: number;
        description: string;
      }[];
    }[];
    quizzes: {
      id: string;
      name: string;
      maxScore: number;
      studentScore: number;
      los: string[];//array of "id,level"
    }[];
  }[];
}

interface studentResult {
  studentID: string,
  studentName: string,
  scores: Array<Number>
}

const BackButton = styled.button`
  float: left;
  margin-top: 10px;
  padding: 5px;
  margin-right: 15px;
  font: 18px;
`;

const TableScrollDiv = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  transform: rotateX(180deg);
`
const TableScrollable = styled(Table)`
  transform: rotateX(180deg);
`
