import React, { useEffect, useState } from 'react';
import { Link } from "gatsby";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

interface LOResponse {
  loID: string;
  loTitle: string;
  levels: {
    level: number;
    levelDescription: string;
  }[];
  linkedPLOs: {
    ploID: string;
    ploName: string;
  }[];
}

const LO: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [los, setLOs] = useState<LOResponse[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<LOResponse[]>('/los', { params: { programID, courseID } })
      .then((res) => res.data)
      .then(setLOs);
  }, []);
  return (
    <Layout>
      <Seo title="LO" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <Link to={`/programs/${programID}/courses`}>{programID}</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="../">{courseID}</Link>
        &nbsp;&#12297;&nbsp;
        <span>LO</span>
      </p>
      {los.map((lo) => (
        <div key={lo.loID} className="rounded shadow-lg p-3">
          {lo.loTitle}
          <ul>
          {
            lo.levels.map((level) => (
              <li key={`${lo.loID}-${level.level}`}>
                Level {level.level} - {level.levelDescription}
              </li>
            ))
          }
          </ul>
          <br/>
          <div className="flex space-x-2">
            <CreateLOLevelForm programID={programID} courseID={courseID} loID={lo.loID}/>
            <CreatePLOLinkForm programID={programID} courseID={courseID} loID={lo.loID}/>
          </div>
        </div>
      ))}
      <CreateLOForm programID={programID} courseID={courseID}/>
    </Layout>
  );
}

const CreateLOForm: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ loTitle: string, initLevel: number, description: string }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new lo</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.loTitle != '' && form.description != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              console.log(programID)
              api.post('/lo', {...form, programID, courseID}).then(() => {
                setValue('loTitle', '');
                setValue('description', '');
                setShow(false);
                window.location.reload();
              });
            } else {
              alert('fill everything before submit')
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new LO</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>LO Title:</span><br/>
            <input type="text" {...register('loTitle')} /><br/>
            <span>(Add initial LO level) Level:</span><br/>
            <input type="text" {...register('initLevel')} /><br/>
            <span>Level Description:</span><br/>
            <input type="text" {...register('description')} /><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

const CreateLOLevelForm: React.FC<{programID: string, courseID: string, loID: string}> = ({programID, courseID, loID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ level: number, description: string }>();
  return (
    <>
      <button className="underline" onClick={() => setShow(true)}>Create a new lo level.</button>
      <Modal className="underline" show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.description != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/lolevel', {...form, loID, programID, courseID}).then(() => {
                setValue('description', '');
                setShow(false);
                window.location.reload();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new LO level</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>LO Level:</span><br/>
            <input type="text" {...register('level')} /><br/>
            <span>Description:</span><br/>
            <input type="text" {...register('description')} /><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

interface PLOResponse {
  ploID: string;
  ploName: string;
}

const CreatePLOLinkForm: React.FC<{programID: string, courseID: string, loID: string}> = ({programID, courseID, loID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ ploID: string }>();
  const [plos, setPLOs] = useState<PLOResponse[]>([]);
  useEffect(() => {
    if (show) {
      const api = axios.create({
        baseURL: 'http://localhost:5000/api'
      });
      api
        .get<PLOResponse[]>('/plos', { params: { programID } })
        .then((res) => res.data)
        .then(setPLOs);
    } else {
      setValue('ploID', '');
    }
  }, [show])
  return (
    <div>
      <button className="underline" onClick={() => setShow(true)}>Link to a PLO.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.ploID != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/plolink', {...form, loID, programID, courseID}).then(() => {
                setShow(false);
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new LO Link to PLOs</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>Select a PLO:</span><br/>
            <select {...register('ploID')}>
              {plos.map((plo) => (
                <option value={plo.ploID} key={plo.ploID}>
                  {plo.ploName}
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
}

export default LO;