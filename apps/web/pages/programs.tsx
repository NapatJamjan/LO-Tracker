import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import Head from 'next/head';
import Link from 'next/link';
import { gql, useMutation } from '@apollo/client';
import ClientOnly from '../components/ClientOnly';
import { GetStaticProps } from 'next';
import client from '../apollo-client';
import { useRouter } from 'next/router';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export interface CreateProgramModel {
  name: string;
  description: string;
};

export interface CreateProgramRepsonse {
  id: string;
  name: string;
  description: string;
};

export default function Programs({programs}: {programs: ProgramModel[]}) {
  return (<div>
    <Head>
      <title>Program</title>
    </Head>
    <p>
      <Link href="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <span>Programs</span>
    </p>
    <div className="py-1"></div>
    <div className="flex flex-row-reverse">
      <ClientOnly>
        <CreateProgramForm/>
      </ClientOnly>
    </div>
    <div className="py-1"></div>
    <ProgramList programs={[...programs]}/>
  </div>);
};

function ProgramList({programs}: {programs: ProgramModel[]}) {
  return (<div>
    {programs.sort((p1, p2) => p1.name.localeCompare(p2.name)).map((program) => (
      <div key={program.id} className="rounded shadow-lg p-3 divide-y-2 mt-3 flex flex-column space-y-2">
        <Link href={`/program/${program.id}/courses`}>
          <span className="font-semibold text-2xl">
            {program.name}
            <span style={{ fontSize: "0.6rem" }}>&#128279;</span>
          </span>
        </Link><br />
        <div className="text-gray-600">{program.description}</div>
      </div>
    ))}
  </div>);
}

function CreateProgramForm() {
  const router = useRouter();
  const CREATE_PROGRAM = gql`
    mutation CreateProgram($input: CreateProgramInput!) {
      createProgram(input: $input) {
        id
        name
        description
      }
    }
  `;
  const [createProgram, { loading } ] = useMutation<{createProgram: CreateProgramRepsonse}, {input: CreateProgramModel}>(CREATE_PROGRAM);
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: { errors, touchedFields } } = useForm<CreateProgramModel>();
  const resetForm = () => {
    reset({ name: '', description: '' });
    setShow(false);
  };
  const submitForm = (form: CreateProgramModel) => {
    createProgram({ 
      variables: {input: form} 
    }).then((res) => {
      resetForm();
      router.push(`/program/${res.data.createProgram.id}/courses`);
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

export const getStaticProps: GetStaticProps<{programs: ProgramModel[]}> = async (_) => {
  const GET_PROGRAMS = gql`
    query Programs {
      programs {
        id
        name
        description
      }
    }
  `;
  const { data } = await client.query<{programs: ProgramModel[]}>({
    query: GET_PROGRAMS
  });
  return {
    props: {
      programs: data.programs,
    },
    revalidate: false,
  }
};
