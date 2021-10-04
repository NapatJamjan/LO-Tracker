import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import XLSX from 'xlsx';
import { studentResponse, programResponse, courseResponse } from '../../../../../../shared/initialData';
import { studentResult, StudentUpload } from './table';

//still broke

export const ExportOutcome: React.FC<{programID, courseID}> = ({programID, courseID}) => {
  const [students, setStudents] = useState<StudentUpload[]>([
    {studentID: "000", studentName: "Loading..", studentSurname: "Loading...", studentEmail: "Loading."}
  ]);
  useEffect(() => {
    const api = axios.create({ baseURL: `http://localhost:5000/api` }); 
    api
      .get<studentResponse[]>('/students', {params: { programID, courseID }})
      .then((res) => res.data).then(setStudents);   
  }, [])
  useEffect(() => {
    console.log("student change", students)
    _setCheck(Array.from({ length: students.length + 1 }, () => false))
  }, [students])
  
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setValue } = useForm<{fileName: string, fileType: string}>();
  const [ check, _setCheck ] = useState<Array<boolean>>([false]);
  
  useEffect(() => {
    if (!show) {
      _setCheck(Array.from({ length: students.length + 1 }, () => false));
      setValue('fileName', '');
      setValue('fileType', 'xlsx');
    }
  }, [show]);
  function handleCheck(id:number){
    check[id] = !check[id];
    _setCheck(check.slice());
    console.log(check)
  }
  function handleCheckAll(){
    check[check.length - 1] = !check[check.length - 1];
    for (let i = 0; i < check.length; i++) {
      if (check[i] != check[check.length - 1]) {check[i] = !check[i]};
    }
    _setCheck(check.slice());
    console.log(check)
  }

  return(
    <div style={{display: "inline", position: "absolute", right: 50}}>
      <button onClick={() => setShow(true)} className="underline ">Export Outcome</button>
      <Modal show={show} onHide={() => setShow(false)} dialogClassName="modal-90w"> 
        <form onSubmit={handleSubmit((data) => {
          setShow(false);
          exportExcel(students ,check, data.fileName, data.fileType);
        })}>
          <ModalHeader >
            <ModalTitle>Export Outcome</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p style={{ marginBottom: 0 }}>Select student to export outcome data</p>
            <OptionDiv>

              <label>File Name:</label>
              <input type="text" {...register('fileName')} style={{transform: "scale(0.9)"}} 
              placeholder="Outcome Result" className="border rounded-md border-2 "/><br/>

              <input type="checkbox" checked={check[check.length - 1]} onClick={() => handleCheckAll()}/>
              <label>Select All</label>

              <select style={{float: "right"}} {...register('fileType')} className="border rounded-md border-2 ">
                <option value={"xlsx"}>Excel</option>
                <option value={"csv"}>CSV</option>
                {/* <option value="pdf" onClick={() => setFileType("csv")}>PDF</option> */}
              </select>

              <p style={{float: "right", paddingRight: 10}}>File Type</p>
            </OptionDiv>
            {students.map((std, row) => (
              <CheckBoxDiv>
                <input type="checkbox" name={"std" + std.studentID.toString()} value={check.toString()}
                  checked={check[row]} onChange={() => handleCheck(row)} />
                <label>{std.studentID} &nbsp;&nbsp; {std.studentName} {std.studentSurname}</label><br/>
              </CheckBoxDiv>
            ))}
          </ModalBody>
          <ModalFooter>
            <input type="submit" value="Export"/>
          </ModalFooter>
        </form>
      </Modal>
    </div>)
}

function exportExcel(students: Array<StudentUpload>, selectedStudent: Array<boolean>, fileName: string, fileType: string) {
    const wb = XLSX.utils.book_new();
    let data:string[][] = [['Student ID','Student Mail', 'Student Name', 'Score'],]
    if(fileName === ''){fileName = 'Outcome Result'}
    for (let i = 0; i < selectedStudent.length-1; i++) {
      if(selectedStudent[i] === true) {
        console.log('adding student' + i);
        data.push([students[i].studentID, students[i].studentEmail, students[i].studentName, '100'])
      }
    }
    if(data.length !== 1){
      const sheet = XLSX.utils.json_to_sheet([{}], {});
      XLSX.utils.sheet_add_json(sheet, data, {origin: 'A3'});
      //quick fix to the blank row problem
      delete_row(sheet,0);delete_row(sheet,0);delete_row(sheet,0);
      XLSX.utils.book_append_sheet(wb, sheet);
      XLSX.writeFile(wb, fileName + '.' + fileType, {bookType: fileType as XLSX.BookType });
    }
    else{
      alert("Please select student.")
    }
  }
  function ec(r: any, c: any) {
    return XLSX.utils.encode_cell({r: r, c: c});
  }
  function delete_row(ws: any, row_index: any) {
    var variable = XLSX.utils.decode_range(ws["!ref"])
    for (var R = row_index; R < variable.e.r; ++R) {
      for (var C = variable.s.c; C <= variable.e.c; ++C) {
        ws[ec(R, C)] = ws[ec(R + 1, C)];
      }
    }
    variable.e.r--
    ws['!ref'] = XLSX.utils.encode_range(variable.s, variable.e);
}

const OptionDiv = styled.div`
  border-bottom: lightgrey 0.5px solid;
  padding-bottom:5px;
  margin-bottom:10px;
  input{
    transform: scale(1.25);
    margin-right: 10px;
  }
`;

const CheckBoxDiv = styled.div`
  font-size: 18px;
  input{
    transform: scale(1.5);
    margin-right: 10px;
  }
`;

////////////////////////////////////////////////////////////////////////
export const ExportOutcome2: React.FC<{programID, courseID, datas: studentResult[], head: string[]}> = 
({programID, courseID, datas, head}) => {
  const [students, setStudents] = useState<StudentUpload[]>([
    {studentID: "000", studentName: "Loading..", studentSurname: "Loading...", studentEmail: "Loading."}
  ]);
  useEffect(() => {
    const api = axios.create({ baseURL: `http://localhost:5000/api` }); 
    api
      .get<studentResponse[]>('/students', {params: { programID, courseID }})
      .then((res) => res.data).then(setStudents);   
  }, [])
  
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setValue } = useForm<{fileName: string, fileType: string}>();
  
  useEffect(() => {
    if (!show) {
      setValue('fileName', '');
      setValue('fileType', 'xlsx');
    }
  }, [show]);

  return(
    <div style={{display: "inline", position: "absolute", right: 50}}>
      <button onClick={() => setShow(true)} className="underline ">Export Outcome</button>
      <Modal show={show} onHide={() => setShow(false)} dialogClassName="modal-90w"> 
        <form onSubmit={handleSubmit((data) => {
          setShow(false);
          exportExcel2(datas, head, data.fileName, data.fileType);
        })}>
          <ModalHeader >
            <ModalTitle>Export Outcome</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p style={{ marginBottom: 0 }}>Choose file name and file type.</p>
            <div>
              <label>File Name : </label>
              <input type="text" {...register('fileName')} style={{transform: "scale(0.9)"}} 
              placeholder="Outcome Result" className="border rounded-md border-2 "/><br/>

              <label style={{paddingRight: 10}}>File Type : </label>
              <select {...register('fileType')} className="border rounded-md border-2 ">
                <option value={"xlsx"}>Excel</option>
                <option value={"csv"}>CSV</option>
                {/* <option value="pdf" onClick={() => setFileType("csv")}>PDF</option> */}
              </select>

            </div>
          </ModalBody>
          <ModalFooter>
            <input type="submit" value="Export"/>
          </ModalFooter>
        </form>
      </Modal>
    </div>)
}

function exportExcel2(datas: studentResult[], head: string[], fileName: string, fileType: string) {
  const wb = XLSX.utils.book_new();
  let data:string[][] = [[...head],]
  if(fileName === ''){fileName = 'Outcome Result'}
  for (let i = 1; i < datas.length; i++) {
    data.push([datas[i].studentID, datas[i].studentName]);
    for (let j = 0; j < datas[i].scores.length; j++) {
      data[i].push(datas[i].scores[j].toString());
      
    }
  }
  const sheet = XLSX.utils.json_to_sheet([{}], {});
  XLSX.utils.sheet_add_json(sheet, data, {origin: 'A3'});
  //quick fix to the blank row problem
  delete_row(sheet,0);delete_row(sheet,0);delete_row(sheet,0);
  XLSX.utils.book_append_sheet(wb, sheet);
  XLSX.writeFile(wb, fileName + '.' + fileType, {bookType: fileType as XLSX.BookType });
}