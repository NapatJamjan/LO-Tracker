import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../../../../components/layout';
import Seo from '../../../../../components/seo';
import xlsx from 'xlsx';
import { CourseNameLink, ProgramNameLink } from '../../../../../components/namebar';

interface StudentUpload {
  /**
   * Excel Header Format
   */
  studentID: string;
  studentEmail: string;
  studentName: string;
  studentSurname: string;
}

const Student: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [students, setStudents] = useState<StudentUpload[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<StudentUpload[]>('/students', { params: { programID, courseID } })
      .then((res) => res.data)
      .then(setStudents);
  }, []);
  const studentUploader = (students: StudentUpload[]) => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    console.log(JSON.stringify(students))
    api
      .post<StudentUpload[]>('/students', { programID, courseID, students: JSON.stringify(students) })
      .then(() => {
        window.location.reload();
      });
  }
  
  const excelJSON = (file) => {
    let reader = new FileReader();
    reader.onload = function(e) {
      let data = e.target.result;
      let workbook = xlsx.read(data, {type: 'binary'});
      studentUploader(xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
    }
    reader.onerror = console.log;
    reader.readAsBinaryString(file);
  }
  return (
    <Layout>
      <Seo title="Student" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
        &nbsp;&#12297;&nbsp;
        <CourseNameLink programID={programID} courseID={courseID} to="../" />
        &nbsp;&#12297;&nbsp;
        <span>Student</span>
      </p>
      <input type="file" onChange={e => excelJSON(e.target.files[0])}/>
      <table className="table-auto">
        <thead>
          <tr>
            <td>Student ID</td>
            <td>Student Email</td>
            <td>Student Name</td>
            <td>Student Surname</td>
          </tr>
        </thead>
        <tbody>
          {
            students.map((student) => (
              <tr key={student.studentID}>
                <td>{student.studentID}</td>
                <td>{student.studentEmail}</td>
                <td>{student.studentName}</td>
                <td>{student.studentSurname}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </Layout>
  );
}

export default Student;