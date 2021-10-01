import React, { useEffect, useState } from 'react';
import { Link } from "gatsby";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

interface LOResponse {
  loID: string;
  info: string;
  levels: {
    level: number;
    info: string;
  }[]
}

const LO: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [los, setLOs] = useState<LOResponse[]>([]);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<LOResponse[]>('/los', { params: { courseID } })
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
          {lo.info}
          <ul>
          {
            lo.levels.map((level) => (
              <li key={`${lo.loID}-${level}${level.info}`}>
                Level {level.level} - {level.info}
              </li>
            ))
          }
          </ul>
          <br/>
          <div className="flex space-x-2"><CreateLOLevelForm loID={lo.loID}/> <CreatePLOLinkForm programID={programID} loID={lo.loID}/> <ShowPLOlinksModal loID={lo.loID} /></div>
        </div>
      ))}
      <CreateLOForm courseID={courseID}/>
    </Layout>
  );
}

const CreateLOForm: React.FC<{courseID}> = ({courseID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ info: string }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new lo</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.info != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/lo', {...form, courseID}).then(() => {
                setValue('info', '');
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
            <input type="text" {...register('info')} />
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

const CreateLOLevelForm: React.FC<{loID}> = ({loID}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ info: string, level: number }>();
  return (
    <>
      <button className="underline" onClick={() => setShow(true)}>Create a new lo level.</button>
      <Modal className="underline" show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.info != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/lolevel', {...form, loID}).then(() => {
                setValue('info', '');
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
            <span>Info:</span><br/>
            <input type="text" {...register('info')} /><br/>
            <span>Level:</span><br/>
            <input type="text" {...register('level')} />
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
  info: string;
}

const CreatePLOLinkForm: React.FC<{programID: string, loID: string}> = ({programID, loID}) => {
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
              api.post('/plolink', {...form, loID}).then(() => {
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
                  {plo.info}
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

const ShowPLOlinksModal: React.FC<{loID: string}> = ({loID}) => {
  const [show, setShow] = useState<boolean>(false);
  const [plos, setPLOs] = useState<PLOResponse[]>([]);
  useEffect(() => {
    if (show) {
      const api = axios.create({
        baseURL: 'http://localhost:5000/api'
      });
      api
        .get<PLOResponse[]>('/plolinks', { params: { loID } })
        .then((res) => res.data)
        .then(setPLOs);
    }
  }, [show])
  return (
    <div>
      <button className="ml-3 underline" onClick={() => setShow(true)}>Show linked PLO.</button>
      <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header>
            <Modal.Title>Linked PLOs</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {plos.map((plo, index) => (
              <p>{index + 1}) {plo.info}</p>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
      </Modal>
    </div>
  );
}

export default LO;