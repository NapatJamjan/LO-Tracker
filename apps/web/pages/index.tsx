import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { gql, useMutation } from '@apollo/client';
import xlsx from 'xlsx';

export default function Index() {
  return (<div>
    <Head>
      <title>Home</title>
    </Head>
    <h1>Welcome</h1>
    <Link href="/programs"><h4 className="underline cursor-pointer"> Go to my document </h4></Link>
    <p>A Capstone project about tracking learning outcome of each and all students in your course.</p>
    <Link href="/login"><h4 className="line-through"> Login </h4></Link>
    <UploadStudents />
  </div>);
};

interface StudentExcel {
  id: string;
  email: string;
  name: string;
  surname: string;
}

const UploadStudents: React.FC = () => {
  const CREATE_STUDENTS = gql`
    mutation CreateStudents($input: [CreateStudentInput!]!) {
      createStudents(input: $input) {
        id
      }
    }
  `;
  const [createStudents, {loading: submitting}] = useMutation<{createStudent: {id: string}}, {input: StudentExcel[]}>(CREATE_STUDENTS);
  const uploadToDB = (students: StudentExcel[]) => {
    createStudents({
      variables: {
        input: students
      }
    }).then(() => {
      alert('success');
    }).catch((err) => {
      alert(JSON.stringify(err))
    });
  };
  const excelJSON = (file) => {
    let reader = new FileReader();
    reader.onload = function(e) {
      let data = e.target.result;
      let workbook = xlsx.read(data, {type: 'binary'});
      uploadToDB(xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
    }
    reader.onerror = console.log;
    reader.readAsBinaryString(file);
  };
  return (<div>
    <span>upload students: </span>
    <input type="file" onChange={e => excelJSON(e.target.files[0])} className="p-1 mx-2 text-sm"/><br/>
    {submitting && <p>Uploading...</p>}
  </div>);
};
