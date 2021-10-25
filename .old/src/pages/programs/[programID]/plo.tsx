import React, { useState } from 'react';
import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useMutation, useQuery } from '@apollo/client';
import { Link } from 'gatsby';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Layout from '../../../components/layout';
import { ProgramNameLink } from '../../../components/namebar';
import Seo from '../../../components/seo';
import { CreatePLOGroupResponse, CreatePLOModel } from '../../../shared/graphql/program/mutation';
import { PLOGroupModel, PLOModel } from '../../../shared/graphql/program/query';
import xlsx from 'xlsx';

const PLOGroup: React.FC<{ programID: string }> = ({ programID }) => {
  const { data, loading, refetch } = useQuery<GetPLOGroupsData, GetPLOGroupsVars>(GET_PLOGROUPS, {variables: {programID}});
  const [selectedPLOGroupID, setSelectedPLOGroupID] = useState<string>('');
  return (
    <Layout>
      <Seo title="PLOs' Program" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to=""/>
      </p>
      <p className="my-3">
        <Link to="../courses">Courses</Link>
        <span className="mx-3"></span>
        <span className="underline">PLOs</span>
      </p>
      <CreatePLOGroupForm programID={programID} callback={() => { refetch(); setSelectedPLOGroupID(''); }}/>
      <div className="grid grid-cols-2 gap-x gap-x-6 mt-2">
        <div className="flex flex-column space-y-2">
          {loading && <p>Loading...</p>}
          {data && [...data.ploGroups].sort((p1, p2) => p1.name.localeCompare(p2.name)).map((ploGroup) => (
            <div key={ploGroup.id} className="rounded shadow-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">{ploGroup.name}</span>
              </div>
              <span className="underline cursor-pointer text-blue-300" onClick={() => setSelectedPLOGroupID(ploGroup.id)}>Manage</span>
            </div>
          ))}
        </div>
        <div>
          {selectedPLOGroupID !== '' && <PLOs ploGroupID={selectedPLOGroupID}/>}
        </div>
      </div>
    </Layout>
  );
};

const CreatePLOGroupForm: React.FC<{ programID: string, callback: () => any }> = ({programID, callback}) => {
  const [createPLOGroup, { loading }] = useMutation<CreatePLOGroupData, CreatePLOGroupVars>(CREATE_PLOGROUP);
  const [excelFile, setExcelFile] = useState<CreatePLOModel[]>([]);
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
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{name: string}>();
  const resetForm = () => {
    setShow(false);
    setValue('name', '');
    setExcelFile([]);
  };
  const submitForm = (name: string) => {
    if (name !== '' && excelFile.length !== 0) {
      createPLOGroup({
        variables: {
          programID,
          name,
          input: excelFile
        }
      }).then(() => {
        resetForm();
        callback();
      });
    }
  }
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new PLO Group.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form onSubmit={handleSubmit((form) => loading? null: submitForm(form.name))}>
          <Modal.Header>
            <Modal.Title>Create a new PLO group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>PLO group name:</span><br/>
            <input type="text" {...register('name')} placeholder="PLO group name" className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
            <span>Upload PLOs:</span><br/>
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

const PLOs: React.FC<{ ploGroupID: string }> = ({ ploGroupID }) => {
  if (ploGroupID === '') {
    return <p></p>;
  }
  const { data, loading, refetch } = useQuery<GetPLOsData, GetPLOsVars>(GET_PLOS, { variables: { ploGroupID } });
  if (loading) {
    return <p>Loading...</p>
  }
  return (
    <div>
      <CreatePLOForm ploGroupID={ploGroupID} callback={refetch}/>
      {[...data.plos].sort((p1, p2) => p1.title.localeCompare(p2.title)).map((plo) => (
        <div key={plo.id} className="flex flex-column rounded shadow-lg p-3 mb-3 -space-y-4">
          <p className="text-xl text-bold">{plo.title}</p>
          <span>{plo.description}</span>
        </div>
      ))}
    </div>
  );
};

const CreatePLOForm: React.FC<{ ploGroupID: string, callback: () => any }> = ({ ploGroupID, callback }) => {
  const [createPLO, { loading }] = useMutation<CreatePLOData, CreatePLOVars>(CREATE_PLO);
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: {errors, touchedFields} } = useForm<CreatePLOModel>();
  const resetForm = () => {
    reset({title: '', description: ''});
    setShow(false);
  };
  const submitForm = (form: CreatePLOModel) => {
    createPLO({
      variables: {
        ploGroupID,
        input: form
      }
    }).then(() => {
      resetForm();
      callback();
    });
  };
  return (
    <div>
      <button onClick={() => setShow(true)} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new PLO <span className="text-xl text-green-800">+</span>
      </button>
      <Modal show={show} onHide={() => resetForm()}>
        <form onSubmit={handleSubmit((form) => loading? null: submitForm(form))}>
          <Modal.Header>
            <Modal.Title>Create a new PLO</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" {...register('title', {required: true})} placeholder="type PLO's name" className="border-4 rounded-md p-1 mx-2 text-sm"/>
            <br/><span className="text-red-500 text-sm italic pl-3">{touchedFields.title && errors.title && 'PLO name is required.'}</span>
            <p className="my-3"></p>
            <textarea {...register('description')} placeholder="PLO's description" cols={40} rows={4} className="border-4 rounded-md p-1 mx-2 text-sm"></textarea>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

const ApolloPLOGroup: React.FC<{programID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><PLOGroup programID={props.programID}/></ApolloProvider>
};

const GET_PLOGROUPS = gql`
  query PLOGroups($programID: ID!) {
    ploGroups(programID: $programID) {
      id
      name
    }
  }
`;

interface GetPLOGroupsData {
  ploGroups: PLOGroupModel[];
};

interface GetPLOGroupsVars {
  programID: string;
};

const CREATE_PLOGROUP = gql`
  mutation CreatePLOGroup($programID: ID!, $name: String!, $input: [CreatePLOsInput!]!) {
    createPLOGroup(programID: $programID, name: $name, input: $input) {
      id
      name
    }
  }
`;

interface CreatePLOGroupData {
  createPLOGroup: CreatePLOGroupResponse;
};

interface CreatePLOGroupVars {
  programID: string;
  name: string;
  input: CreatePLOModel[];
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

const CREATE_PLO = gql`
  mutation CreatePLO($ploGroupID: ID!, $input: CreatePLOInput!) {
    createPLO(ploGroupID: $ploGroupID, input: $input) {
      id
      title
      description
      ploGroupID
    }
  }
`;

interface CreatePLOData {
  createPLO: CreatePLOData;
};

interface CreatePLOVars {
  ploGroupID: string;
  input: CreatePLOModel;
};

export default ApolloPLOGroup;
