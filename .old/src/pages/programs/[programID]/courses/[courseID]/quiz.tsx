import React, { useEffect, useState } from 'react';
import { Link } from "gatsby";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { CourseNameLink, ProgramNameLink } from '../../../../../components/namebar';
import xlsx from 'xlsx';
import { QuestionLinkModel, QuizModel } from '../../../../../shared/graphql/quiz/query';
import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useMutation, useQuery } from '@apollo/client';
import { CreateQuestionLinkModel, CreateQuestionLinkResponse, CreateQuestionModel, CreateQuizModel, CreateQuizResponse, DeleteQuestionLinkModel, DeleteQuestionLinkResponse } from '../../../../../shared/graphql/quiz/mutation';
import { LOModel } from '../../../../../shared/graphql/course/query';

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
  const los = useQuery<GetLOsData, GetLOsVars>(GET_LOS, {variables: {courseID}});
  const [selectedQuestionID, setSelectedQuestionID] = useState<string>('');
  const { data, loading, refetch } = useQuery<GetQuizzesData, GetQuizzesVars>(GET_QUIZZES, { variables: { courseID } });
  const [deleteQuestionLink, {loading: submitting}] = useMutation<DeleteQuestionLinkData, DeleteQuestionLinkVars>(DELETE_QUESTIONLINK);
  let quizzes: QuizModel[] =  [];
  if (data) {
    quizzes = [...data.quizzes];
  }
  let questionLinks: QuestionLinkModel[] = [];
  if (selectedQuestionID !== '' && data) {
    questionLinks = quizzes.filter((quiz) => quiz.questions.findIndex((question) => question.id === selectedQuestionID) !== -1)[0]
      .questions.filter((question) => question.id === selectedQuestionID)[0].loLinks;
  }
  const removeQuestionLink = (loID: string, level: number) => {
    if (submitting) {
      return;
    }
    deleteQuestionLink({
      variables: {
        input: {
          questionID: selectedQuestionID,
          loID,
          level
        }
      }
    }).then(() => refetch());
  };
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
        <CourseNameLink courseID={courseID} to="../" />
        &nbsp;&#12297;&nbsp;
        <span>LO</span>
      </p>
      <CreateQuizForm programID={programID} courseID={courseID} callback={refetch}/>
      <div className="grid grid-cols-2 gap-x gap-x-6 mt-2">
        <div className="flex flex-column space-y-2">
          {loading && <p>Loading...</p>}
          {quizzes.sort((q1, q2) => q1.name.localeCompare(q2.name)).map((quiz) => (
          <div key={quiz.id} className="rounded shadow-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-bold">{quiz.name}</span>
            </div>
            <ul>
            {
              [...quiz.questions].sort((q1, q2) => q1.title.localeCompare(q2.title)).map((question, index) => (
                <li key={question.id}>
                  Q{index + 1}) {question.title} (max score: {question.maxScore})
                  <div className="flex flex-row-reverse space-x-2">
                    <button
                      onClick={() => {setSelectedQuestionID(question.id)}}
                      className={`bg-gray-200 hover:bg-gray-400 py-1 px-2 rounded text-sm ${selectedQuestionID===question.id?'bg-blue-400 hover:bg-blue-300':''}`}>
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
            <CreateQuestionLinkForm los={[...los.data.los]} questionID={selectedQuestionID} callback={refetch}/>
            <div className="pt-3">
              <span>Linked LOs: </span><br/>
              <ul>
              {
                [...questionLinks].sort((l1, l2) => l1.description.localeCompare(l2.description)).map((lo) => (
                  <li key={`${lo.loID}-${lo.level}`}>
                    {lo.description}&nbsp;
                    <span className="cursor-pointer text-red-600" onClick={() => removeQuestionLink(lo.loID, lo.level)}>&#9747;</span>
                  </li>
                ))
              }
              {questionLinks.length === 0 && <span>No linked LOs</span>}
              </ul>
            </div>  
          </div>}
        </div>
      </div>
    </Layout>
  );
};

const CreateQuizForm: React.FC<{programID: string, courseID: string, callback: () => any}> = ({programID, courseID, callback}) => {
  const [createQuiz, {loading: submitting}] = useMutation<CreateQuizData, CreateQuizVars>(CREATE_QUIZ);
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ name: string }>();
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
            if (form.name === '' || excelFile.length === 0 || submitting) {
              return
            }
            let questions = new Map<string, CreateQuestionModel>();
            for (let i = 0; i < excelFile.length; ++i) {
              let question: CreateQuestionModel = {
                title: '',
                maxScore: 0,
                results: []
              };
              if (questions.has(excelFile[i].questionTitle)) {
                question = questions.get(excelFile[i].questionTitle);
              }
              question.title = excelFile[i].questionTitle;
              question.maxScore = excelFile[i].maxScore;
              question.results = [...question.results, {
                studentID: `${excelFile[i].studentID}`,
                score: excelFile[i].studentScore
              }];
              questions.set(excelFile[i].questionTitle, question);
            }
            createQuiz({
              variables: {
                courseID,
                input: {
                  name: form.name,
                  createdAt: new Date(),
                  questions: [...questions.values()]
                }
              }
            }).then(() => {
              setValue('name', '');
              setExcelFile([]);
              setShow(false);
              callback();
            });
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new quiz</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>Quiz name:</span><br/>
            <input type="text" {...register('name')} placeholder="quiz name" className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
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

const CreateQuestionLinkForm: React.FC<{los: LOModel[], questionID: string, callback: () => any}> = ({los, questionID, callback}) => {
  const [createQuestionLink, { loading: submitting }] = useMutation<CreateQuestionLinkData, CreateQuestionLinkVars>(CREATE_QUESTIONLINK);
  const [selectedLOID, setSelectedLOID] = useState<string>('');
  const { register, handleSubmit, setValue } = useForm<CreateQuestionLinkModel>({defaultValues: {loID: '', level: 0}});
  const resetForm = () => {
    setValue('loID', '');
    setValue('level', 0);
  };
  const submitForm = (form: CreateQuestionLinkModel) => {
    if (form.loID === '' || form.level === 0 || submitting) {
      return;
    }
    createQuestionLink({
      variables: {
        input: {
          ...form,
          questionID
        },
      }
    }).then(() => {
      resetForm();
      setSelectedLOID('');
      callback();
    });
  };
  return (
    <form onSubmit={handleSubmit((form) => submitForm(form))}>
      <span>Select LO:</span><br/>
      <select {...register('loID')} className="border-4 rounded-md p-1 mx-2 text-sm w-2/4" defaultValue="" onChange={e => {setSelectedLOID(e.target.value);setValue('level', 0);}}>
        <option disabled value="">--Select LO--</option>
        {los.sort((l1, l2) => l1.title.localeCompare(l2.title)).map((lo) => (
          <option value={lo.id} key={lo.id}>
            {lo.title}
          </option>
        ))}
      </select><br/>
      {selectedLOID !== '' && <div>
        <span>Select Level:</span><br/>
        <select {...register('level')} className="border-4 rounded-md p-1 mx-2 text-sm w-2/4" defaultValue={0}>
          <option disabled value={0}>--Select Level--</option>
          {los[los.findIndex((lo) => lo.id == selectedLOID)] && los[los.findIndex((lo) => lo.id == selectedLOID)].levels.map((level) => (
            <option value={level.level} key={level.description}>
              {level.description}
            </option>
          ))}
        </select>
      </div>}<br/>
      <input type="submit" value="add" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
    </form>
  );
};

const ApolloQuiz: React.FC<{programID: string, courseID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><Quiz programID={props.programID} courseID={props.courseID}/></ApolloProvider>
};

const GET_LOS = gql`
  query LOs($courseID: ID!) {
    los(courseID: $courseID) {
      id
      title
      levels {
        level
        description
      }
      ploLinks {
        id
        title
        description
        ploGroupID
      }
    }
  }
`;

interface GetLOsData {
  los: LOModel[]
};

interface GetLOsVars {
  courseID: string;
};

const GET_QUIZZES = gql`
  query Quizzes($courseID: ID!) {
    quizzes(courseID: $courseID) {
      id
      name
      createdAt
      questions {
        id
        title
        maxScore
        loLinks {
          loID
          level
          description
        }
      }
    }
  }
`;

interface GetQuizzesData {
  quizzes: QuizModel[];
};

interface GetQuizzesVars {
  courseID: string;  
};

const DELETE_QUESTIONLINK = gql`
  mutation DeleteQuestionLink($input: DeleteQuestionLinkInput!) {
    deleteQuestionLink(input: $input) {
      questionID
      loID
    }
  }
`;

interface DeleteQuestionLinkData {
  deleteQuestionLink: DeleteQuestionLinkResponse;
};

interface DeleteQuestionLinkVars {
  input: DeleteQuestionLinkModel;
};

const CREATE_QUESTIONLINK = gql`
  mutation CreateQuestionLink($input: CreateQuestionLinkInput!) {
    createQuestionLink(input: $input) {
      questionID
      loID
    }
  }
`;

interface CreateQuestionLinkData {
  createQuestionLink: CreateQuestionLinkResponse;
};

interface CreateQuestionLinkVars {
  input: CreateQuestionLinkModel;
};

const CREATE_QUIZ = gql`
  mutation CreateQuiz($courseID: ID!, $input: CreateQuizInput!) {
    createQuiz(courseID: $courseID, input: $input) {
      id
    }
  }
`;

interface CreateQuizData {
  createQuiz: CreateQuizResponse;
};

interface CreateQuizVars {
  courseID: string;
  input: CreateQuizModel;
};

export default ApolloQuiz;
