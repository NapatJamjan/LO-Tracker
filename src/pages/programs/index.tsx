import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import Layout from '../../components/layout';
import Seo from '../../components/seo';
import { Link } from 'gatsby';
import { gql, useMutation, useQuery, ApolloProvider, InMemoryCache, ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ProgramModel } from '../../shared/graphql/program/query';
import { CreateProgramModel, CreateProgramRepsonse } from '../../shared/graphql/program/mutation';

const Programs = () => {
  const { data, loading, refetch } = useQuery<GetProgramsData>(GET_PROGRAMS);
  return (
    <Layout>
      <Seo title="Programs" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <span>Programs</span>
      </p>
      <div className="py-1"></div>
      <div className="flex flex-row-reverse">
        <CreateProgramForm callback={refetch} />
      </div>
      <div className="py-1"></div>
      {loading && <p>Loading...</p>}
      {data && [...data.programs].sort((p1, p2) => p1.name.localeCompare(p2.name)).map((program) => (
        <div key={program.id} className="rounded shadow-lg p-3 divide-y-2 mt-3 flex flex-column space-y-2">
          <Link to={`./${program.id}/courses`} className="font-semibold text-2xl">{program.name} <span style={{ fontSize: "0.6rem" }}>&#128279;</span></Link><br />
          <div className="text-gray-600">{program.description}</div>
        </div>
      ))}
    </Layout>
  );
};

const CreateProgramForm: React.FC<{ callback: () => any }> = ({ callback }) => {
  const [createProgram, { loading } ] = useMutation<CreateProgramData, CreateProgramVars>(CREATE_PROGRAM);
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: { errors, touchedFields } } = useForm<CreateProgramModel>();
  const resetForm = () => {
    reset({ name: '', description: '' });
    setShow(false);
  };
  const submitForm = (form: CreateProgramModel) => {
    createProgram({ 
      variables: {input: form} 
    }).then(() => {
      resetForm();
      callback();
    });
  };
  return (
    <div>
      <button onClick={() => setShow(true)} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new program <span className="text-xl text-green-800">+</span>
      </button>
      <Modal show={show} onHide={() => resetForm()}>
        <form onSubmit={handleSubmit((form) => loading ? null: submitForm(form))}>
          <Modal.Header>
            <Modal.Title className="font-bold">Create a new program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" {...register('name', { required: true })} placeholder="type a program name" className="border-4 rounded-md p-2" />
            <br /><span className="text-red-500 text-sm italic">{touchedFields.name && errors.name && 'Program name is required.'}</span>
            <p className="my-3 text-xs"></p>
            <textarea {...register('description')} placeholder="program's description" cols={30} className="border-4 rounded-md p-2" rows={4}></textarea>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

const ApolloPrograms = () => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><Programs /></ApolloProvider>
};

const GET_PROGRAMS = gql`
  query Programs {
    programs {
      id
      name
      description
    }
  }
`;

interface GetProgramsData {
  programs: ProgramModel[];
};

const CREATE_PROGRAM = gql`
  mutation CreateProgram($input: CreateProgramInput!) {
    createProgram(input: $input) {
      id
      name
      description
    }
  }
`;

interface CreateProgramData {
  createProgram: CreateProgramRepsonse;
};

interface CreateProgramVars {
  input: CreateProgramModel;
};

export default ApolloPrograms;
