import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Layout from '../../../components/layout';
import { ProgramNameLink } from '../../../components/namebar';
import Seo from '../../../components/seo';

interface PLOResponse {
  ploID: string;
  ploName: string;
  ploDescription: string;
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
        <ProgramNameLink programID={programID} to=""/>
      </p>
      <p className="my-3">
        <Link to="../courses">Courses</Link>
        <span className="mx-3"></span>
        <span className="underline">PLOs</span>
      </p>
      <div className="flex flex-row-reverse mt-4 mb-3">
        <CreatePLOForm programID={programID} />
      </div>
      {plos.sort((p1, p2) => p1.ploName.localeCompare(p2.ploName)).map((plo) => (
        <div key={plo.ploID} className="flex flex-column rounded shadow-lg p-3 mb-3 -space-y-4">
          <p className="text-xl text-bold">{plo.ploName}</p>
          <span>{plo.ploDescription}</span>
        </div>
      ))}
    </Layout>
  );
};

const CreatePLOForm: React.FC<{ programID }> = ({ programID }) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: {errors, touchedFields} } = useForm<{ ploName: string, ploDescription: string }>();
  const resetForm = () => reset({ploName: '', ploDescription: ''});
  return (
    <div>
      <button onClick={() => setShow(true)} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new PLO <span className="text-xl text-green-800">+</span>
      </button>
      <Modal show={show} onHide={() => {resetForm();setShow(false)}}>
        <form
          onSubmit={handleSubmit((form) => {
            const api = axios.create({
              baseURL: 'http://localhost:5000/api'
            });
            api.post('/plo', { ...form, programID }).then(() => {
              resetForm();
              setShow(false);
              window.location.reload();
            });
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new PLO</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" {...register('ploName', {required: true})} placeholder="type PLO's name" className="border-4 rounded-md p-1 mx-2 text-sm"/>
            <br/><span className="text-red-500 text-sm italic pl-3">{touchedFields.ploName && errors.ploName && 'PLO name is required.'}</span>
            <p className="my-3"></p>
            <textarea {...register('ploDescription')} placeholder="PLO's description" cols={40} rows={4} className="border-4 rounded-md p-1 mx-2 text-sm"></textarea>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default PLO;
