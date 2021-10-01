import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Layout from '../../../../../components/layout';
import Seo from '../../../../../components/seo';
import xlsx from 'xlsx';

interface QuizResponse {
  quizID: string;
  title: string;
  questions: {
    questionID: string;
    title: string;
    maxScore: number;
  }[]
}

interface QuestionUpload { 
  /**
   * Excel Header Format
   */
  title: string;
  maxScore: number;
  studentID: string;
  studentScore: number;
}

const Quiz: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<QuizResponse[]>('/quizzes', { params: { courseID } })
      .then((res) => res.data)
      .then(setQuizzes);
  }, []);
  const questionUploader = (questions: QuestionUpload[], quizID: string) => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .post<QuestionUpload[]>('/questions', { quizID, questions: JSON.stringify(questions) })
      .then(() => {
        window.location.reload();
      });
  };
  const excelJSON = (file, quizID: string) => {
    let reader = new FileReader();
    reader.onload = function(e) {
      let data = e.target.result;
      let workbook = xlsx.read(data, {type: 'binary'});
      questionUploader(xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]), quizID);
    }
    reader.onerror = console.log;
    reader.readAsBinaryString(file);
  };
  return (
    <Layout>
      <Seo title="Quiz" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <Link to={`/programs/${programID}/courses`}>{programID}</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="../">{courseID}</Link>
        &nbsp;&#12297;&nbsp;
        <span>Quiz</span>
      </p>
      {quizzes.map((quiz) => (
        <div key={quiz.quizID} className="rounded shadow-lg p-3">
          {quiz.title}
          <ul>
          {
            quiz.questions && quiz.questions.map((question, index) => (
              <div key={question.questionID} style={{borderBottom:"grey 1px solid"}}>
              <li key={question.questionID}>Q {index + 1} - {question.title} (max score: {question.maxScore})</li>
              <CreateQuestionLinkForm courseID={courseID} question={question.title}/>
              </div>
            ))
          }
          </ul>
          <input type="file" onChange={(e) => excelJSON(e.target.files[0], quiz.quizID)} />
        </div>
      ))}
      <CreateQuizForm courseID={courseID}/>
    </Layout>
  );
}

const CreateQuizForm: React.FC<{courseID: string}> = ({courseID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ title: string }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new quiz.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.title != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/quiz', {...form, courseID}).then(() => {
                setValue('title', '');
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
            <input type="text" {...register('title')} />
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

interface LOResponse {
  loID: string;
  info: string;
  levels: Array<{
    level: number;
    info: string;
  }>
}
interface questionlinkRequest {
  questionID: string;
  loID: string;
  level: string;
}
const CreateQuestionLinkForm: React.FC<{courseID: string, question: string}> = ({courseID, question}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ title: string }>();
  const [los, setLOs] = useState<LOResponse[]>([]);
  useEffect(() => {
    if (show) {
      const api = axios.create({
        baseURL: 'http://localhost:5000/api'
      });
      api
        .get<LOResponse[]>('/los', { params: { courseID } })
        .then((res) => res.data)
        .then(setLOs);
    } else {
      //setValue('ploID', '');
    }
  }, [show])
  return (
    <div>
      <button onClick={() => setShow(true)} style={{fontSize:16}} className="underline" >Link LO</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.title != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/quiz', {...form, courseID}).then(() => {
                setValue('title', '');
                setShow(false);
                window.location.reload();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Link a Question to LO Level</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Target : {question}</h5>
            {los.map((lo) => (
              <div style={{borderBottom: "grey 1px solid", marginBottom:5}}>
                {lo.info}
                {lo.levels.map((lvl) => (
                  <div>
                    <input type="checkbox"/>Level {lvl.level} {lvl.info}
                  </div>
                ))}
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Quiz;
