import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import Layout from '../../components/layout';
import Seo from '../../components/seo';
import { Link } from 'gatsby';

interface ProgramResponse {
  programID: string;
  programName: string;
  programDescription: string;
}

const Programs = () => {
  const [programs, setPrograms] = useState<ProgramResponse[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<ProgramResponse[]>('/programs')
      .then((res) => res.data)
      .then(setPrograms);
  }, []);
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
        <CreateProgramForm />
      </div>
      <div className="py-1"></div>
      {programs.sort((p1, p2) => p1.programName.localeCompare(p2.programName)).map((program) => (
        <div key={program.programID} className="rounded shadow-lg p-3 divide-y-2 mt-3 flex flex-column space-y-2">
          <Link to={`./${program.programID}/courses`} className="font-semibold text-2xl">{program.programName} <span style={{fontSize: "0.6rem"}}>&#128279;</span></Link><br/>
          <div className="text-gray-600">{program.programDescription}</div>
        </div>
      ))}
    </Layout>
  );
};

const CreateProgramForm = () => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: {errors, touchedFields} } = useForm<{ programName: string, programDescription: string }>();
  const resetForm = () => reset({programName: '', programDescription: ''});
  return (
    <div>
      <button onClick={() => setShow(true)} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new program <span className="text-xl text-green-800">+</span>
      </button>
      <Modal show={show} onHide={() => {resetForm();setShow(false)}}>
        <form
          onSubmit={handleSubmit((form) => {
            //if (form.programName != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/program', form).then(() => {
                resetForm();
                setShow(false);
                window.location.reload();
              });
            //}
          })}
        >
          <Modal.Header>
            <Modal.Title className="font-bold">Create a new program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" {...register('programName', {required: true})} placeholder="type a program name" className="border-4 rounded-md p-2"/>
            <br/><span className="text-red-500 text-sm italic">{touchedFields.programName && errors.programName && 'Program name is required.'}</span>
            <p className="my-3 text-xs"></p>
            <textarea {...register('programDescription')} placeholder="program's description" cols={30} className="border-4 rounded-md p-2" rows={4}></textarea>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Programs;
