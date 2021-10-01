import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import XLSX from 'xlsx';
import { studentResponse, programResponse, courseResponse } from '../../../../../../shared/initialData';

//still broke

export const ExportOutcome: React.FC<{courseID}> = ({courseID}) => {
  const [student, setStudent] = useState<Array<studentResponse>>([{studentID: "000", studentName: "Loading..."}])
  useEffect(() => {
    const api = axios.create({baseURL: `http://localhost:5000/api`}); 
      ( async () => {
        let res1 = await api.get<programResponse[]>('/programs');
        let res2 = await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID}});
        let res3 = await api.get<studentResponse[]>('/students', {params: {courseID: res2.data[0].courseID}});
        setStudent(res3.data)
      }) ()
  },[])
  
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setValue } = useForm<{fileName: string, fileType: string}>();
  const [ check, _setCheck ] = useState<Array<boolean>>(
    Array.from({length: student.length+1}, () => false)
  );
  
  useEffect(() => {
    if (!show) {
      _setCheck(Array.from({ length: student.length + 1 }, () => false));
      setValue('fileType', 'xlsx');
    }
  }, [show]);
  function handleCheck(id:number){
    check[id] = !check[id];
    _setCheck(check.slice());
  }
  function handleCheckAll(){
    check[check.length - 1] = !check[check.length - 1];
    for (let i = 0; i < check.length; i++) {
      if (check[i] != check[check.length - 1]) {check[i] = !check[i]};
    }
    _setCheck(check.slice());
  }

  return(
    <div style={{display: "inline", position: "absolute", right: 50}}>
      <button onClick={() => setShow(true)}>Export Outcome</button>

      <Modal show={show} onHide={() => setShow(false)}>
        <form onSubmit={handleSubmit((data) => {
          setShow(false);
          exportExcel(check, data.fileName, data.fileType);
        })}>
          <ModalHeader >
            <ModalTitle>Export Outcome</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p style={{ marginBottom: 0 }}>Select student to export outcome data</p>
            <OptionDiv>

              <label>File Name:</label>
              <input type="text" {...register('fileName')} style={{transform: "scale(0.9)"}} placeholder="Outcome Result" /><br/>

              <input type="checkbox" checked={check[check.length - 1]} onClick={() => handleCheckAll()}/>
              <label>Select All</label>

              <select style={{float: "right"}} {...register('fileType')}>
                <option value={"xlsx"}>Excel</option>
                <option value={"csv"}>CSV</option>
                {/* <option value="pdf" onClick={() => setFileType("csv")}>PDF</option> */}
              </select>

              <p style={{float: "right", paddingRight: 10}}>File Type</p>
            </OptionDiv>
            {student.map((std, row) => (
              <CheckBoxDiv>
                <input type="checkbox" name={"std" + std.studentID.toString()} value={check[ row].toString()}
                  checked={check[ row]} onClick={() => handleCheck( row)} readOnly />
                <label>{std.studentName}</label><br/>
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

function exportExcel(selectedStudent: Array<boolean>, fileName: string,fileType: string) {

    const wb = XLSX.utils.book_new();
    let data:string[][] = [['Student Mail', 'Student Name', 'Score'],]
    if(fileName === ''){fileName = 'Outcome Result'}
    for (let i = 0; i < selectedStudent.length-1; i++) {
      if(selectedStudent[i] === true) {
        console.log('adding student' + i);
        //data.push([students[i].mail, students[i].name, '100'])
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