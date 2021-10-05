import React, { useEffect, useState } from 'react';
import { Link } from "gatsby";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { CourseNameLink, ProgramNameLink } from '../../../../../components/namebar';

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

interface PLOResponse {
  ploID: string;
  ploName: string;
  ploDescription: string;
}

const LO: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [los, setLOs] = useState<LOResponse[]>([]);
  const [plos, setPLOs] = useState<PLOResponse[]>([]);
  const [selectedLOID, setSelectedLOID] = useState<string>('');
  const { register, handleSubmit, setValue } = useForm<{ ploID: string }>({defaultValues: {ploID: ''}});
  const fetchLO = () => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<LOResponse[]>('/los', { params: { programID, courseID } })
      .then((res) => res.data)
      .then(setLOs);
  }
  const deleteLinkedPLO = (ploID: string) => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .delete('/plolink', { data: { programID, courseID, ploID, loID: selectedLOID } })
      .then(() => fetchLO());
  }
  useEffect(() => {
    fetchLO();
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
      <Seo title="LO" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
        &nbsp;&#12297;&nbsp;
        <CourseNameLink programID={programID} courseID={courseID} to="../" />
        &nbsp;&#12297;&nbsp;
        <span>LO</span>
      </p>
      <CreateLOForm programID={programID} courseID={courseID} callback={fetchLO}/>
      <div className="grid grid-cols-2 gap-x gap-x-6 mt-2">
        <div className="flex flex-column space-y-2">
          {los.sort((l1, l2) => l1.loTitle.localeCompare(l2.loTitle)).map((lo) => (
          <div key={lo.loID} className="rounded shadow-lg p-3">
            {lo.loTitle}
            <ul>
            {
              lo.levels.map((level) => (
                <li key={`${lo.loID}-${level.level}`}>
                  Level {level.level}<br/>{level.levelDescription}
                </li>
              ))
            }
            </ul>
            <br/>
            <div className="flex flex-row-reverse space-x-2">
            <button
              onClick={() => setSelectedLOID(lo.loID)}
              className={`bg-gray-200 hover:bg-gray-400 py-1 px-2 rounded text-sm ${selectedLOID===lo.loID?'bg-blue-400 hover:bg-blue-300':''}`}>
              Manage PLOs <span className="text-xl text-green-800">&#9874;</span>
            </button>
              <span className="px-2"></span>
              <CreateLOLevelForm programID={programID} courseID={courseID} loID={lo.loID} initLevel={lo.levels.length + 1} callback={fetchLO}/>
            </div>
          </div>
        ))}
        </div>
        <div>
          {selectedLOID !== '' && 
          <div className="flex flex-column divide-y-4">
            <form onSubmit={handleSubmit((form) => {
              if (form.ploID !== '') {
                const api = axios.create({
                  baseURL: 'http://localhost:5000/api'
                });
                api.post('/plolink', {...form, loID: selectedLOID, programID, courseID}).then(() => {
                  setValue('ploID', '');
                  fetchLO();
                });
              }
            })}>
              <select {...register('ploID')} className="border-4 rounded-md p-1 mx-2 text-sm" defaultValue="">
                <option disabled value="">--Select PLO--</option>
                {plos.sort((p1, p2) => p1.ploName.localeCompare(p2.ploName)).map((plo) => (
                  <option value={plo.ploID} key={plo.ploID}>
                    {plo.ploName}
                  </option>
                ))}
              </select>
              <input type="submit" value="add" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
            </form>
            <div className="pt-3">
              <span>Linked PLOs: </span><br/>
              <ul>
              {
                los.findIndex((lo) => lo.loID == selectedLOID) !== -1 && los[los.findIndex((lo) => lo.loID == selectedLOID)]
                  .linkedPLOs.sort((p1, p2) => p1.ploName.localeCompare(p2.ploName))
                  .map((p1) => plos.find((p2) => p1.ploID === p2.ploID))
                  .map((p) => (
                    <li key={p.ploID}>
                      <span>{p.ploName}</span><br/>
                      <span>{p.ploDescription}</span>&nbsp;
                      <span className="cursor-pointer text-red-600" onClick={() => deleteLinkedPLO(p.ploID)}>&#9747;</span>
                    </li>
                  ))
              }
              {
                los.findIndex((lo) => lo.loID == selectedLOID) !== -1 && los[los.findIndex((lo) => lo.loID == selectedLOID)].linkedPLOs.length === 0
                && <span>No linked PLOs</span>
              }
              </ul>
            </div>  
          </div>}
        </div>
      </div>
    </Layout>
  );
}

const CreateLOForm: React.FC<{programID: string, courseID: string, callback: () => any}> = ({programID, courseID, callback}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ loTitle: string, initLevel: number, description: string }>({
    defaultValues: {
      loTitle: '',
      initLevel: 1,
      description: '',
    }
  });
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new LO</button>
      <Modal show={show} onHide={() => {reset({loTitle: '', initLevel: 1, description: ''});setShow(false)}}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.loTitle != '' && form.description != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/lo', {...form, programID, courseID}).then(() => {
                reset({loTitle: '', initLevel: 1, description: ''});
                callback();
                setShow(false);
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
            <input type="text" {...register('loTitle', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/><br/>
            <span>Initial LO Level:</span><br/>
            <span className="border-4 rounded-md p-1 mx-2 text-sm bg-gray-200 inline-block w-1/3">{1}</span><br/>
            <span>Level Description:</span><br/>
            <textarea {...register('description', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm" cols={40} rows={4}/><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

const CreateLOLevelForm: React.FC<{programID: string, courseID: string, loID: string, initLevel: number, callback: () => any}> = ({programID, courseID, loID, initLevel, callback}) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{ level: number, description: string }>({
    defaultValues: {
      level: initLevel,
      description: '',
    }
  });
  return (
    <>
      <button onClick={() => setShow(true)} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new LO level <span className="text-xl text-green-800">+</span>
      </button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.description != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/lolevel', {...form, loID, programID, courseID}).then(() => {
                setValue('description', '');
                setShow(false);
                callback();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new LO level</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>LO Level:</span><br/>
            <span className="border-4 rounded-md p-1 mx-2 text-sm bg-gray-200 pointer-events-none inline-block w-1/3" >{initLevel}</span><br/>
            <span>Description:</span><br/>
            <textarea {...register('description')} className="border-4 rounded-md p-1 mx-2 text-sm" cols={40} rows={4}></textarea><br/>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default LO;