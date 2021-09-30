import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import Layout from '../../components/layout';
import Seo from '../../components/seo';
import { Link } from 'gatsby';

interface ProgramResponse {
  programID: string;
  userID: string;
  programName: string;
  description: string;
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
      {programs.map((program) => (
        <div key={program.programID} className="rounded shadow-lg p-3">
          <Link to={`./${program.programID}/courses`}>{program.programName}</Link>
        </div>
      ))}
      <div className="py-3"></div>
      <CreateProgramForm />
    </Layout>
  );
};

const CreateProgramForm = () => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ name: string }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new program.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.name != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/program', form).then(() => {
                setValue('name', '');
                setShow(false);
                window.location.reload();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" {...register('name')} />
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Programs;
