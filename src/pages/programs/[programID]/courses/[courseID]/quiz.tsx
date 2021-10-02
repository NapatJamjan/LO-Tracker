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

interface QuestionUpload { 
  /**
   * Excel Header Format
   */
  questionTitle: string;
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
      .get<QuizResponse[]>('/quizzes', { params: { programID, courseID } })
      .then((res) => res.data)
      .then(setQuizzes);
  }, []);
  const questionUploader = (questions: QuestionUpload[], quizID: string) => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .post<QuestionUpload[]>('/questions', { programID, courseID, quizID, questions: JSON.stringify(questions) })
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
          {quiz.quizName}
          <ul>
          {
            quiz.questions && quiz.questions.map((question, index) => (
              <div key={question.questionID} style={{borderBottom:"grey 1px solid"}}>
              <li key={question.questionID}>
                <span>Q {index + 1} - {question.questionTitle} (max score: {question.maxScore})</span>
                {JSON.stringify(question)}
                <ol>
                  {
                    question.linkedLOs.map((lvl) => (
                      <li>
                        <span>Level {lvl.level} - {lvl.levelDescription}</span>
                      </li>
                    ))
                  }
                </ol>
              </li>
              <CreateQuestionLinkForm programID={programID} courseID={courseID} quizID={quiz.quizID} questionID={question.questionID}/>
              </div>
            ))
          }
          </ul>
          <input type="file" onChange={(e) => excelJSON(e.target.files[0], quiz.quizID)} />
        </div>
      ))}
      <CreateQuizForm programID={programID} courseID={courseID}/>
    </Layout>
  );
}

const CreateQuizForm: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ quizName: string }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new quiz.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.quizName !== '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/quiz', {...form, programID, courseID}).then(() => {
                setValue('quizName', '');
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
            <input type="text" {...register('quizName')} />
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
  loTitle: string;
  levels: {
    level: number;
    levelDescription: string;
  }[]
}
interface questionlinkRequest {
  questionID: string;
  loID: string;
  level: string;
}
const CreateQuestionLinkForm: React.FC<{programID: string, courseID: string, quizID: string, questionID: string}> = ({programID, courseID, quizID, questionID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ loIndex: number, levelIndex: number }>({defaultValues: {loIndex: 0, levelIndex: 0}});
  const [los, setLOs] = useState<LOResponse[]>([]);
  const [selectedLOIndex, setSelectedLOIndex] = useState<number>(0);
  useEffect(() => {
    if (show) {
      const api = axios.create({
        baseURL: 'http://localhost:5000/api'
      });
      api
        .get<LOResponse[]>('/los', { params: { programID, courseID } })
        .then((res) => res.data)
        .then(setLOs);
    }
  }, [show])
  return (
    <div>
      <button onClick={() => setShow(true)} style={{fontSize:16}} className="underline" >Link LO</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            const api = axios.create({
              baseURL: 'http://localhost:5000/api'
            });
            console.log(JSON.stringify( {programID, courseID, quizID, questionID, loID: los[form.loIndex].loID, level: los[form.loIndex].levels[form.levelIndex].level}))
            api.post('/questionlink', {programID, courseID, quizID, questionID, loID: los[form.loIndex].loID, level: los[form.loIndex].levels[form.levelIndex].level}).then(() => {
              setValue('loIndex', 0);
              setShow(false);
              window.location.reload();
            });
          })}
        >
          <Modal.Header>
            <Modal.Title>Link a Question to LO Level</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>LO:</span>
            <br />
            <select {...register('loIndex')} onChange={e => {setSelectedLOIndex(parseInt(e.target.value, 10)); setValue('levelIndex', 0)}}>
              {los.map((lo, index) => (
                <option value={index} key={lo.loID}>
                  {lo.loTitle}
                </option>
              ))}
            </select><br/>
            <span>LO Level:</span>
            <br />
            <select {...register('levelIndex')}>
              {los[selectedLOIndex] && los[selectedLOIndex].levels.map((lvl, index) => (
                <option value={index} key={`${los[selectedLOIndex].loID}-${lvl.level}`}>
                  {lvl.levelDescription}
                </option>
              ))}
            </select>
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
