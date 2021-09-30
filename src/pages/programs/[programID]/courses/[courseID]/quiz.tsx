import React, { useContext, useEffect, useState } from 'react';
import { Button, Collapse, Modal, ModalBody, ModalFooter, ModalTitle } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { LOContext } from '../../../../../shared/lo';
import { QuizContext, QuestionDetail, LinkedLO } from '../../../../../shared/quiz';
// import { QuestionArray, clearExcel, interpretExcel } from '../../../../../utils';

const Quiz: React.FC<{courseID: string}> = ({courseID}) => {
  const { quizzes } = useContext(QuizContext)
  const [ open, _setOpen ] = useState<Array<Array<boolean>>>(quizzes.map(quiz => { 
    return Array.from({length: quiz.question.length + 1}, () => false);
  }));
  useEffect(() => {
    open.push(Array.from({length: quizzes[quizzes.length-1].question.length+1}, () => false))
  }, [quizzes]);
  function toggle(row: number, col: number) {
    open[row][col] = !open[row][col];
    _setOpen(open.slice());
  }
  return (
    <div style={{marginLeft: 10}}>
      <h3>Quiz List</h3>
      {
        quizzes.map((quiz, row) => (
          <Quizcard key={`row-${row}`} >
            <LinkLOButton quiz={quiz.id} question={-1}/>
            <Quizlist onClick={() => toggle(row, 0)}>
              {quiz.name}
            </Quizlist>
            <Collapse in={open[row][0]}>
              {
                <div style={{marginLeft: 30}}>
                  {quiz.question.map((question, col) => (
                    <div key={`row-${row}-col-${col}`}>
                      <LinkLOButton quiz={quiz.id} question={col}/>
                      <Quizlist onClick={() => toggle(row, col + 1)}>
                        {question.name}
                      </Quizlist>
                      <Collapse in={open[row][col + 1]}>
                        <Question style={{marginLeft: 30}}>
                          <p>Max Score {question.maxscore}</p>
                          <p style={{fontWeight: "bolder"}}>
                            Linked LO: {question.linkedLO.map((lolvl) => (
                              <span>LO{lolvl.loID}<span>(
                                {lolvl.lvl.map((lv) => ( <span>{lv} </span> ))}
                                ) </span> 
                              </span>
                            ))}
                          </p>
                        </Question>
                      </Collapse>
                    </div>
                  ))}
                </div>
              }
            </Collapse>
          </Quizcard>
        ))
      }
      {/* <ImportExcelToCourse name="CSC100 Tutorial Course"/> */}
    </div>
  );
}

// function ImportExcelToCourse(props: any){
//   const { addQuiz } = useContext(QuizContext)
//   const [show, setShow] = useState(false);
//   const { register, handleSubmit, setValue } = useForm<{name: string, question: Array<QuestionDetail>}>();
//   useEffect(() => {
//     if (!show) setValue('name', '');
//   }, [show]);
//   return(
//     <div>
//       <button className="floatbutton" onClick={() => setShow(true)} style={{position: "absolute", right: 25, bottom: 25}}>
//         <i className="fa fa-download"></i>Import
//       </button>
//       <Modal show={show} onHide={() => setShow(false)}>
//         <form onSubmit={handleSubmit((data) => {
//           if (QuestionArray.length === 0) {
//             QuestionArray.push({name: "No question imported", maxscore: 0, linkedLO: []});
//           }
//           data.question = QuestionArray;
//           addQuiz(data);
//           setShow(false);
//           clearExcel();
//         })}>
//           <ModalHeader>
//             <ModalTitle>Import quiz result</ModalTitle>
//           </ModalHeader>
//           <ModalBody>
//             <p style={{margin: 0}}>Please import an excel file of the quiz result (.xlsx)</p>
//             <label><b>Course</b></label><br/>
//             <input list="courselist" name="course" value={props.name} readOnly /><br/>
//             <label>Quiz Name</label><br/>
//             <input type="text" {...register('name')} required /><br/>
//             <ImportExcel/>
//           </ModalBody>
//           <ModalFooter>
//             <input type="submit" value="Import"/>
//           </ModalFooter>
//         </form>
//       </Modal>
//     </div>
//   );
// }

// function ImportExcel(props: any) {
//   return (
//     <div>
//       <label>Choose a file to import</label><br/>
//       <input type="file" id="fileUpload" onChange={Upload}/>
//     </div>
//   );   
// }

// function Upload(){
//   const fileUpload = (document.getElementById('fileUpload') as HTMLInputElement);
//   interpretExcel(fileUpload, 'quiz');
// }

function LinkLOButton(props: any){
  const [show, setShow] = useState(false);
  const { los } = useContext(LOContext);
  const { linkLO } = useContext(QuizContext);
  const [open, _setOpen] = useState<Array<Array<boolean>>>(los.map(lo => { 
    return Array.from({length: lo.level.length + 1}, () => false);
  }));

  function toggle(row: number, col: number) {
    open[row][col] = !open[row][col];
    _setOpen(open.slice());
  }
  const [check, _setCheck] = useState<Array<Array<boolean>>>(los.map(lo => { 
    return Array.from({length: lo.level.length + 1}, () => false);
  }));
  useEffect(() => {
    _setCheck(los.map(lo => { return Array.from({length: lo.level.length + 1}, () => false); }));
    _setOpen(los.map(lo => { return Array.from({length: lo.level.length + 1}, () => false); }));
  }, [show]);

  function handleCheck(row: number, col: number) {
    check[row][col] = !check[row][col];
    if (check[row][0] === true) { check[row][0] = false;}
    _setCheck(check.slice());
  }
  function handleCheckAll(row: number) {
    check[row][0] = !check[row][0];
    for (let i = 1; i < check[row].length; i++) {
      if (check[row][i] !== check[row][0]) {check[row][i] = !check[row][i];}
    }
    _setCheck(check.slice());
  }

  const { handleSubmit } = useForm<{
    los: Array<LinkedLO>; quizID: string; questionIndex: number;
  }>();

  return(<div>
    <EditIcon><i className="fa fa-pencil" onClick={() => setShow(true)}></i></EditIcon>
    <Modal show={show} onHide={() => setShow(false)}>
      <form onSubmit={handleSubmit((data) => {
        data.los = ProcessLOLink(check);
        data.quizID = props.quiz; 
        data.questionIndex = props.question;
        linkLO(data); 
        setShow(false);
      })}>

      <ModalHeader>
        <ModalTitle>Link learning outcome to question</ModalTitle>
      </ModalHeader>
        <ModalBody>
          <div>
            <p>Quiz {parseInt(props.quiz) + 1} 
              {props.question === -1 && <span></span> || <span> Question {props.question + 1}</span>}</p>
            {los.map((lo, row) => (
              <CardDiv key={`row-${row}`}>
                <div style={{display: "flex"}}>
                  <LeftCheckbox type="checkbox" checked={check[row][0]} onClick={() => handleCheckAll(row)} readOnly/>
                  <h6 style={{marginBottom: 3, paddingRight: 5}} onClick={() => toggle(row, 0)} key={`lo` + lo.id}>
                    {lo.name}
                  </h6>
                </div>
                <Collapse in={open[row][0]}>{
                  <div style={{marginLeft: 28}}>
                    {lo.level.map((lvl, col) => (
                      <div key={`row-${row}-col-${col}`}>
                        <div style={{display: "flex"}}>
                        <LeftCheckbox type="checkbox" checked={check[row][col + 1]} 
                          onClick={() => handleCheck(row, col + 1)} readOnly/>
                          <p style={{marginBottom: -3, paddingRight: 5}}>
                            {lvl}  
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                }</Collapse>
              </CardDiv>
            ))}
          </div>
        </ModalBody>
      <ModalFooter>
        <input type="submit" value="Save"/>
      </ModalFooter>
      </form>
    </Modal>
  </div>
  )
}

function ProcessLOLink(loCheck:Array<Array<boolean>>){
  let linker:Array<LinkedLO> = [];
  for (let i = 0; i < loCheck.length; i++) {
    linker.push({loID: "",lvl: []})
    if(loCheck[i][0] === true){
      linker[i].loID = (i + 1).toString();
      for (let j = 1; j < loCheck[i].length; j++) {
        linker[i].lvl.push(j);
      }
    }
    else{
      for (let k = 1; k < loCheck[i].length; k++) {
        if(loCheck[i][k] === true){
          linker[i].loID = (i + 1).toString();
          linker[i].lvl.push(k);
        }
      } 
    }
  }
  for (let i = 0; i < linker.length; i++) {
    if(linker[i].loID === "") {
      linker.splice(i, 1); 
      i = i-1;
    }
  }
  // if(linker[0].loID === "") { linker.splice(0, 1); }
  console.log(linker);
  return linker; // ready to be added to question i think
}

export default Quiz;

export const Quizcard = styled.div`
  width: 50%;
  padding-bottom: 20px;
`;

export const Quizlist = styled.h4`
  list-style-type: none;
  text-align: left;
  margin: 0px;
  padding-left: 0px;
  border: #282c34 solid;
  margin-top: -2px;
`;

export const EditIcon = styled.h5`
  right: 45%;
  position: absolute;
`;

export const Question = styled.div`
  list-style-type: none;
  text-align: left;
  margin-left: 50px;
  padding-left: 0px;
  border-left: #282c34 3px solid;
  border-right: #282c34 3px solid;
  &:last-child{
    border-bottom: #282c34 3px solid;
  }
  p{
    margin-bottom: 0px;
  }
`;

// Link LO
export const CardDiv = styled.div`
  border-bottom: grey 0.5px solid;
  margin-bottom: 10px;
  overflow: hidden;
`;

export const LeftCheckbox = styled.input.attrs({
  type:'checkbox'
})`
  transform:scale(1.5);
  margin-left:5px;
  margin-top:auto;
  margin-bottom:auto;
  margin-right:10px;
`;
