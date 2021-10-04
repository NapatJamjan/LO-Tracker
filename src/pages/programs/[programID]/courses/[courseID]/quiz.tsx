import React, { useEffect, useState } from 'react';
import { Link } from "gatsby";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { CourseNameLink, ProgramNameLink } from '../../../../../components/namebar';
import xlsx from 'xlsx';

interface QuizResponse {
  quizID: string;
  quizName: string;
  questions: {
    questionID: string;
    questionTitle: string;
    maxScore: number;
    linkedLOs: {
      loID: string;
      level: number;
      levelDescription: string;
    }[]
  }[]
}

interface LOResponse {
  loID: string;
  loTitle: string;
  levels: {
    level: number;
    levelDescription: string;
  }[];
}

interface QuestionUpload { 
  /**
   * Excel Header Format
   */
  questionTitle: string;
  maxScore: number;
  studentID: string;
  studentScore: number;
}

const LO: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [los, setLOs] = useState<LOResponse[]>([]);
  const [selectedQuestionID, setSelectedQuestionID] = useState<string>('');
  const [selectedQuizID, setSelectedQuizID] = useState<string>('');
  const [selectedLOID, setSelectedLOID] = useState<string>('');
  const { register, handleSubmit, setValue } = useForm<{ loID: string, level: number }>({defaultValues: {loID: '', level: 0}});
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const fetchQuiz = () => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<QuizResponse[]>('/quizzes', { params: { programID, courseID } })
      .then((res) => res.data)
      .then(setQuizzes);
  }
  const deleteLinkedLO = (loID: string) => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .delete('/questionlink', { data: { programID, courseID, quizID: selectedQuizID, questionID: selectedQuestionID, loID } })
      .then(() => fetchQuiz());
  }
  useEffect(() => {
    fetchQuiz();
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<LOResponse[]>('/los', { params: { programID, courseID } })
      .then((res) => res.data)
      .then(setLOs);
  }, []);
  let linkedLOs: {
    loID: string;
    level: number;
    levelDescription: string;
  }[] = [];
  if (selectedQuizID !== '' && selectedQuestionID !== '') {
    let quiz = quizzes[quizzes.findIndex((quiz) => quiz.quizID == selectedQuizID)].questions;
    linkedLOs = quiz[quiz.findIndex((question) => question.questionID == selectedQuestionID)].linkedLOs;
  }
  return (
    <Layout>
      <Seo title="LO" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
        &nbsp;&#12297;&nbsp;
        <CourseNameLink programID={programID} courseID={courseID} to="../" />
        &nbsp;&#12297;&nbsp;
        <span>LO</span>
      </p>
      <CreateQuizForm programID={programID} courseID={courseID}/>
      <div className="grid grid-cols-2 gap-x gap-x-6 mt-2">
        <div className="flex flex-column space-y-2">
          {quizzes.sort((q1, q2) => q1.quizName.localeCompare(q2.quizName)).map((quiz) => (
          <div key={quiz.quizID} className="rounded shadow-lg p-3">
            {quiz.quizName}
            <ul>
            {
              quiz.questions.sort((q1, q2) => q1.questionTitle.localeCompare(q2.questionTitle)).map((question, index) => (
                <li key={question.questionID}>
                  Q{index + 1}) {question.questionTitle} (max score: {question.maxScore})
                  <div className="flex flex-row-reverse space-x-2">
                    <button
                      onClick={() => {setSelectedQuizID(quiz.quizID);setSelectedQuestionID(question.questionID)}}
                      className={`bg-gray-200 hover:bg-gray-400 py-1 px-2 rounded text-sm ${selectedQuestionID===question.questionID?'bg-blue-400 hover:bg-blue-300':''}`}>
                      Manage LOs <span className="text-xl text-green-800">&#9874;</span>
                    </button>
                  </div>
                </li>
              ))
            }
            </ul>
            <br/>
          </div>
        ))}
        </div>
        <div>
          {selectedQuestionID !== '' && 
          <div className="flex flex-column divide-y-4">
            <form onSubmit={handleSubmit((form) => {
              if (form.loID !== '' && form.level !== 0) {
                const api = axios.create({
                  baseURL: 'http://localhost:5000/api'
                });
                api.post('/questionlink', {...form, questionID: selectedQuestionID, programID, courseID, quizID: selectedQuizID}).then(() => {
                  setValue('loID', '');
                  setValue('level', 0);
                  fetchQuiz();
                });
              }
            })}>
              <span>Select LO:</span><br/>
              <select {...register('loID')} className="border-4 rounded-md p-1 mx-2 text-sm w-2/4" defaultValue="" onChange={e => {setSelectedLOID(e.target.value);setValue('level', 0);}}>
                <option disabled value="">--Select LO--</option>
                {los.sort((l1, l2) => l1.loTitle.localeCompare(l2.loTitle)).map((lo) => (
                  <option value={lo.loID} key={lo.loID}>
                    {lo.loTitle}
                  </option>
                ))}
              </select><br/>
              {selectedLOID !== '' && <div>
                <span>Select Level:</span><br/>
                <select {...register('level')} className="border-4 rounded-md p-1 mx-2 text-sm w-2/4" defaultValue={0}>
                  <option disabled value={0}>--Select Level--</option>
                  {los[los.findIndex((lo) => lo.loID == selectedLOID)].levels.map((level) => (
                    <option value={level.level} key={level.levelDescription}>
                      {level.levelDescription}
                    </option>
                  ))}
                </select>
              </div>}<br/>
              <input type="submit" value="add" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
            </form>
            <div className="pt-3">
              <span>Linked LOs: </span><br/>
              <ul>
              {
                linkedLOs.sort((l1, l2) => l1.levelDescription.localeCompare(l2.levelDescription)).map((lo) => (
                  <li key={lo.loID}>{lo.levelDescription}&nbsp;<span className="cursor-pointer text-red-600" onClick={() => deleteLinkedLO(lo.loID)}>&#9747;</span></li>
                ))
              }
              {linkedLOs.length === 0 && <span>No linked LOs</span>}
              </ul>
            </div>  
          </div>}
        </div>
      </div>
    </Layout>
  );
}

const CreateQuizForm: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ quizName: string }>();
  const [excelFile, setExcelFile] = useState<QuestionUpload[]>([]);
  const excelJSON = (file) => {
    let reader = new FileReader();
    reader.onload = function(e) {
      let data = e.target.result;
      let workbook = xlsx.read(data, {type: 'binary'});
      setExcelFile(xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
    }
    reader.onerror = console.log;
    reader.readAsBinaryString(file);
  };
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new quiz.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.quizName !== '' && excelFile.length !== 0) {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/quiz-upload', {...form, programID, courseID, questions: excelFile}).then(() => {
                setValue('quizName', '');
                setExcelFile([]);
                setShow(false);
                window.location.reload();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new quiz</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>Quiz name:</span><br/>
            <input type="text" {...register('quizName')} placeholder="quiz name" className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
            <span>Upload quiz result:</span><br/>
            <input type="file" onChange={e => excelJSON(e.target.files[0])} className="p-1 mx-2 text-sm"/><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default LO;