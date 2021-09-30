import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../../../../components/layout';
import Seo from '../../../../../components/seo';
import xlsx from 'xlsx';

interface StudentUpload {
  /**
   * Excel Header Format
   */
  studentID: string;
  studentName: string;
}

const Student: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [students, setStudents] = useState<StudentUpload[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<StudentUpload[]>('/students', { params: { courseID } })
      .then((res) => res.data)
      .then(setStudents);
  }, []);
  const studentUploader = (students: StudentUpload[]) => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .post<StudentUpload[]>('/students', { courseID, students: JSON.stringify(students) })
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
        <Link to={`/programs/${programID}/courses`}>{programID}</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="../">{courseID}</Link>
        &nbsp;&#12297;&nbsp;
        <span>Student</span>
      </p>
      <input type="file" onChange={e => excelJSON(e.target.files[0])}/>
      <table className="table-auto">
        <thead>
          <tr>
            <td>Student ID</td>
            <td>Student Name</td>
          </tr>
        </thead>
        <tbody>
          {
            students.map((student) => (
              <tr key={student.studentID}>
                <td>{student.studentID}</td>
                <td>{student.studentName}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </Layout>
  );
}

export default Student;