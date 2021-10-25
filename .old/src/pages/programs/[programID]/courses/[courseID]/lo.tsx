import React, { useState } from 'react';
import { Link } from "gatsby";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import { CourseNameLink, ProgramNameLink } from '../../../../../components/namebar';
import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useMutation, useQuery } from '@apollo/client';
import { CourseModel, LOModel } from '../../../../../shared/graphql/course/query';
import { CreateLOLevelModel, CreateLOLevelResponse, CreateLOLinkResponse, CreateLOModel, CreateLOResponse, DeleteLOLinkResponse } from '../../../../../shared/graphql/course/mutation';
import { PLOModel } from '../../../../../shared/graphql/program/query';

const LO: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const courseInfo = useQuery<GetCourseData, GetCourseVars>(GET_COURSE, { variables: { courseID } });
  const { data, loading, refetch } = useQuery<GetLOsData, GetLOsVars>(GET_LOS, { variables: { courseID } });
  const [deleteLOLink, {loading: submitting}] = useMutation<DeleteLOLinkData, DeleteLOLinkVars>(DELETE_LOLINK);
  const [selectedLOID, setSelectedLOID] = useState<string>('');
  let los: LOModel[] = [];
  if (data) {
    los = [...data.los];
  }
  const deleteLinkedPLO = (ploID: string) => {
    if (!submitting) {
      deleteLOLink({
        variables: {
          loID: selectedLOID,
          ploID
        }
      }).then(() => refetch());
    }
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
        <CourseNameLink courseID={courseID} to="../" />
        &nbsp;&#12297;&nbsp;
        <span>LO</span>
      </p>
      <CreateLOForm programID={programID} courseID={courseID} callback={refetch}/>
      <div className="grid grid-cols-2 gap-x gap-x-6 mt-2">
        <div className="flex flex-column space-y-2">
          {loading && <p>Loading...</p>}
          {los.sort((l1, l2) => l1.title.localeCompare(l2.title)).map((lo) => (
          <div key={lo.id} className="rounded shadow-lg p-3">
            {lo.title}
            <ul>
            {
              [...lo.levels].sort((l1, l2) => l1.level - l2.level).map((level) => (
                <li key={`${lo.id}-${level.level}`}>
                  Level {level.level}<br/>{level.description}
                </li>
              ))
            }
            </ul>
            <br/>
            <div className="flex flex-row-reverse space-x-2">
            <button
              onClick={() => setSelectedLOID(lo.id)}
              className={`bg-gray-200 hover:bg-gray-400 py-1 px-2 rounded text-sm ${selectedLOID===lo.id?'bg-blue-400 hover:bg-blue-300':''}`}>
              Manage PLOs <span className="text-xl text-green-800">&#9874;</span>
            </button>
              <span className="px-2"></span>
              <CreateLOLevelForm programID={programID} courseID={courseID} loID={lo.id} initLevel={lo.levels.length + 1} callback={refetch}/>
            </div>
          </div>
        ))}
        </div>
        <div>
          {selectedLOID !== '' && 
          <div className="flex flex-column divide-y-4">
            {courseInfo.data && <CreateLOLink loID={selectedLOID} ploGroupID={courseInfo.data.course.ploGroupID} callback={refetch}/>}
            <div className="pt-3">
              <span>Linked PLOs: </span><br/>
              <ul>
              {
                [...los[los.findIndex((lo) => lo.id == selectedLOID)].ploLinks].sort((p1, p2) => p1.title.localeCompare(p2.title))
                .map((plo) => 
                  <li key={plo.id}>
                    <span>{plo.title}</span><br/>
                    <span>{plo.description}</span>&nbsp;
                    <span className="cursor-pointer text-red-600" onClick={() => deleteLinkedPLO(plo.id)}>&#9747;</span>
                  </li>
                )
              }
              {los[los.findIndex((lo) => lo.id == selectedLOID)].ploLinks.length === 0 && <span>No linked PLOs</span>}
              </ul>
            </div>  
          </div>}
        </div>
      </div>
    </Layout>
  );
};

const CreateLOLink: React.FC<{ loID: string, ploGroupID: string, callback: () => any }> = ({ loID, ploGroupID, callback }) => {
  if (ploGroupID === '') {
    return <p></p>;
  }
  const { data, loading }  = useQuery<GetPLOsData, GetPLOsVars>(GET_PLOS, {variables: {ploGroupID}});
  const [createLOLink, {loading: submitting}] = useMutation<CreateLOLinkData, CreateLOLinkVars>(CREATE_LOLINK);
  const { register, handleSubmit, setValue } = useForm<{ploID: string}>({defaultValues: {ploID: ''}});
  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <div>
      <form onSubmit={handleSubmit((form) => {
        if (form.ploID !== '' && !submitting) {
          createLOLink({
            variables: {
              loID,
              ploID: form.ploID
            }
          }).then(() => {
            setValue('ploID', '');
            callback();
          });
        }
      })}>
        <select {...register('ploID')} className="border-4 rounded-md p-1 mx-2 text-sm" defaultValue="">
          <option disabled value="">--Select PLO--</option>
          {[...data.plos].sort((p1, p2) => p1.title.localeCompare(p2.title)).map((plo) => (
            <option value={plo.id} key={plo.id}>
              {plo.title}
            </option>
          ))}
        </select>
        <input type="submit" value="add" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
      </form>
    </div>
  );
}

const CreateLOForm: React.FC<{programID: string, courseID: string, callback: () => any}> = ({programID, courseID, callback}) => {
  const [createLO, { loading }] = useMutation<CreateLOData, CreateLOVars>(CREATE_LO);
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<CreateLOModel>({
    defaultValues: {
      title: '',
      level: 1,
      description: '',
    }
  });
  const resetForm = () => {
    reset({title: '', level: 1, description: ''});
    setShow(false);
  };
  const submitForm = (form: CreateLOModel) => {
    if (form.title !== '' && form.description !== '') {
      createLO({
        variables: {
          courseID,
          input: form
        }
      }).then(() => {
        resetForm();
        callback();
      });
    }
  };
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new LO</button>
      <Modal show={show} onHide={() => resetForm()}>
        <form onSubmit={handleSubmit((form) => loading? null: submitForm(form))}>
          <Modal.Header>
            <Modal.Title>Create a new LO</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>LO Title:</span><br/>
            <input type="text" {...register('title', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
            <span>Initial LO Level:</span><br/>
            <span className="border-4 rounded-md p-1 mx-2 text-sm bg-gray-200 inline-block w-1/3">{1}</span><br/>
            <span>Level Description:</span><br/>
            <textarea {...register('description', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm" cols={40} rows={4}/><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

const CreateLOLevelForm: React.FC<{programID: string, courseID: string, loID: string, initLevel: number, callback: () => any}> = ({programID, courseID, loID, initLevel, callback}) => {
  const [show, setShow] = useState<boolean>(false);
  const [createLOLevel, {loading: submitting}] = useMutation<CreateLOLevelData, CreateLOLevelVars>(CREATE_LOLEVEL);
  const { register, handleSubmit, setValue } = useForm<CreateLOLevelModel>({
    defaultValues: {
      level: initLevel,
      description: '',
    }
  });
  return (
    <>
      <button onClick={() => setShow(true)} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new LO level <span className="text-xl text-green-800">+</span>
      </button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.description === '' || submitting) {
              return;
            }
            createLOLevel({
              variables: {
                loID,
                input: form
              }
            }).then(() => {
              setValue('description', '');
              setShow(false);
              callback();
            });
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new LO level</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>LO Level:</span><br/>
            <span className="border-4 rounded-md p-1 mx-2 text-sm bg-gray-200 pointer-events-none inline-block w-1/3" >{initLevel}</span><br/>
            <span>Description:</span><br/>
            <textarea {...register('description')} className="border-4 rounded-md p-1 mx-2 text-sm" cols={40} rows={4}></textarea><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

const ApolloLO: React.FC<{programID: string, courseID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><LO programID={props.programID} courseID={props.courseID}/></ApolloProvider>
};

const GET_COURSE = gql`
  query Course($courseID: ID!) {
    course(courseID: $courseID) {
      id
      name
      description
      semester
      year
      ploGroupID
    }
  }
`;

interface GetCourseData {
  course: CourseModel;
};

interface GetCourseVars {
  courseID: string;
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

const DELETE_LOLINK = gql`
  mutation DeleteLOLink($loID: ID!, $ploID: ID!) {
    deleteLOLink(loID: $loID, ploID: $ploID) {
      loID
      ploID
    }
  }
`;

interface DeleteLOLinkData {
  deleteLOLink: DeleteLOLinkResponse;
};

interface DeleteLOLinkVars {
  loID: string;
  ploID: string;
};

const GET_PLOS = gql`
  query PLOs($ploGroupID: ID!) {
    plos(ploGroupID: $ploGroupID) {
      id
      title
      description
      ploGroupID
    }
  }
`;

interface GetPLOsData {
  plos: PLOModel[];
};

interface GetPLOsVars {
  ploGroupID: string;
};

const CREATE_LOLINK = gql`
  mutation CreateLOLink($loID: ID!, $ploID: ID!) {
    createLOLink(loID: $loID, ploID: $ploID) {
      loID
      ploID
    }
  }
`;

interface CreateLOLinkData {
  createLOLink: CreateLOLinkResponse;
};

interface CreateLOLinkVars {
  loID: string;
  ploID: string;
};

const CREATE_LO = gql`
  mutation CreateLO($courseID: ID!, $input: CreateLOInput!) {
    createLO(courseID: $courseID, input: $input) {
      id
    }
  }
`;

interface CreateLOData {
  createLO: CreateLOResponse;
};

interface CreateLOVars {
  courseID: string;
  input: CreateLOModel;
};

const CREATE_LOLEVEL = gql`
  mutation CreateLOLevel($loID: ID!, $input: CreateLOLevelInput!) {
    createLOLevel(loID: $loID, input: $input) {
      id
    }
  }
`;

interface CreateLOLevelData {
  createLOLevel: CreateLOLevelResponse;
};

interface CreateLOLevelVars {
  loID: string;
  input: CreateLOLevelModel;
};

export default ApolloLO;
