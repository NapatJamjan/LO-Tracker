import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Layout from '../../../components/layout';
import Seo from '../../../components/seo';

interface PLOResponse {
  ploID: string;
  info: string;
}

const PLO: React.FC<{ programID: string }> = ({ programID }) => {
  const [plos, setPLOs] = useState<PLOResponse[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<PLOResponse[]>('/plos', { params: { programID } })
      .then((res) => res.data)
      .then(setPLOs);
  }, []);
  return (
    <Layout>
      <Seo title="PLOs' Program" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <span>{programID}</span>
      </p>
      <p className="my-3">
        <Link to="../courses">Courses</Link>
        <span className="mx-3"></span>
        <span className="underline">PLOs</span>
      </p>
      {plos.map((plo) => (
        <div key={plo.ploID} className="rounded shadow-lg p-1">
          <p>{plo.info}</p>
        </div>
      ))}
      <div className="py-3"></div>
      <CreatePLOForm programID={programID} />
    </Layout>
  );
};

const CreatePLOForm: React.FC<{ programID }> = ({ programID }) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ info: string }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new PLO.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.info != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/plo', { ...form, programID }).then(() => {
                setValue('info', '');
                setShow(false);
                window.location.reload();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new PLO</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" {...register('info')} />
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default PLO;