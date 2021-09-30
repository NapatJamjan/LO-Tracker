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
              <li key={`${lo.loID}-${level}${level.info}`}>Level {level.level} - {level.info}</li>
            ))
          }
          </ul>
          <br/>
          <CreateLOLevelForm loID={lo.loID}/>
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
      <button onClick={() => setShow(true)}>Create a new lo.</button>
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
    <div>
      <button onClick={() => setShow(true)}>Create a new lo level.</button>
      <Modal show={show} onHide={() => setShow(false)}>
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
    </div>
  );
}


export default LO;