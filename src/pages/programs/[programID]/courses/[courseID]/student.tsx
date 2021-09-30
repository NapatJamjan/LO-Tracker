import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalTitle, Table } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import Layout from '../../../../../components/layout';
import { studentResponse, programResponse, courseResponse, studentRequest } from '../../../../../shared/initialData';
import { StudentData, clearExcel, StudentArray, interpretExcel } from '../../../../../utils';


const api = axios.create({baseURL: `http://localhost:5000/api`}); 

export interface student {
  id: number,
  mail: string,
  name: string;
}

export const students: Array<student> = [{id: 0, mail: "mail@mail.com", name: "Student Studying"},
{id: 1, mail: "mail@moremail.com", name: "Student2 Studying2"}, {id: 2, mail: "std@student.mail", name: "std A"},
{id: 3, mail: "mail@mail.com", name: "Student Studying"}, {id: 4, mail: "student@mail.com", name: "Studying Student"}]

const Student: React.FC<{courseID: string}> = ({courseID}) => {
  const [student, setStudent] = useState<Array<studentResponse>>([{studentID: "000", studentName: "Loading..."}])
  useEffect(() => {
      ( async () => {
        let res1 = await api.get<programResponse[]>('/programs');
        let res2 = await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID}});
        let res3 = await api.get<studentResponse[]>('/students', {params: {courseID: res2.data[0].courseID}});
        setStudent(res3.data)
      }) ()
  },[])
  return (
    <Layout >
      <h2>Student</h2>
      <div style={{margin: "auto"}}>
        <Table striped bordered className="table" responsive="sm">
          <thead>
            <tr>
              <th>Student ID <TableSort /></th>
              <th>Name <TableSort /></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {student.map(std => (
              <tr>
                <td>{std.studentID}</td>
                <td>{std.studentName}</td>
                <td>
                  <Link to={`dashboard/${std.studentID}`} style={{marginRight: 20}}><button>Result</button></Link>
                  <button style={{position:"absolute"}}>Kick</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <ImportStudent/>
    </Layout>
  );
}

export function TableSort(props: any) {
  return (
    <i className="fa fa-sort tableSort"></i>
  )
}

function ImportStudent(){
  const [show, setShow] = useState(false);
  const [course, setCourse] = useState <Array<courseResponse>>([])
  useEffect(() => {
    ( async () => {
      let res1 = await api.get<programResponse[]>('/programs');
      console.log(res1.data)
      let res2 = await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID}});
      setCourse(res2.data)
    }) ()
  },[])
  console.log(course)
  async function importStudent(cID: string, students: Array<StudentData>){
    if(students.length !== 0) {
      await api.post<studentRequest[]>('/students', {courseID: cID, students: 
        [...students]});
      alert("Import success!")
    }
    else{
      alert("No student found!")
    }
  }
  return(
    <div>
      <button className="floatbutton" onClick={() => setShow(true)} style={{position: "absolute", right: 25, bottom: 25}}>
        <i className="fa fa-download"></i>Import
      </button>
      <Modal show={show} onHide={() => {setShow(false); clearExcel();}}>
        <ModalHeader>
          <ModalTitle>Import Students</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p style={{margin: 0}}>Please import an excel file of the students list (.xlsx)</p>
          <ImportExcel />
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => {importStudent(course[0].courseID, StudentArray);  
            setShow(false); clearExcel(); window.location.reload();}}>Save</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function ImportExcel(props: any) {
  return (
    <div>
      <label>Choose a file to import</label><br/>
      <input type="file" id="fileUpload" onChange={Upload}/>
    </div>
  );   
}

function Upload(){
  const fileUpload = (document.getElementById('fileUpload') as HTMLInputElement);
  interpretExcel(fileUpload, 'student');
}

export default Student;
