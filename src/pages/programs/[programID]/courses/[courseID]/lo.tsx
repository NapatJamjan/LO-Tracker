import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Collapse, Modal, ModalBody, ModalFooter, ModalTitle } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { loResponse, programResponse, courseResponse, loRequest, loLevelRequest, ploResponse } from '../../../../../shared/initialData';
import { EditIcon, CardDiv, LeftCheckbox } from './quiz';

let cID:string = "" // course ID
const api = axios.create({baseURL: `http://localhost:5000/api`}); 

const LO: React.FC<{courseID: string}> = ({courseID}) => {
  const [los, _setLos] = useState<Array<loResponse>>([{loID: "123", info: "Loading LO...", levels: [{level: 1, info: "loading"}]}]);
  const [open, _setOpen] = useState<Array<boolean>>([]);
  useEffect(() => {
      ( async () => {
        let res1 = await api.get<programResponse[]>('/programs');
        let res2 = (await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID}}));
        let res3 = await api.get<loResponse[]>('/los', {params: {courseID: res2.data[0].courseID} });
        cID = res2.data[0].courseID
        _setLos(res3.data);
        _setOpen(Array.from({length:res3.data.length}, () => false))
      }) ()
  },[])
  console.log("h",los[0]?.levels.length)
  function toggle(i: number) {
    open[i] = !open[i];
    _setOpen(open.slice());
  }
  return (
    <div>
      <h3>Learning Outcome</h3>
      <div style={{width: 700, marginLeft: 10}}>
        {los.map((lo, row) => (
          <LOcard>
            <EditLO target={lo}/>
            <LinkLOtoPLO target={lo}/>
            <LOlist onClick={() => toggle(row)}>{lo.info}</LOlist>
            <Collapse in={(open[row]) || false}>{
              <div style={{ marginLeft: 28 }}>
                {lo.levels.map((lvl, col) => (
                  <div key={`row-${row}-col-${col}`}>
                    <div style={{ display: "flex" }}>
                      <LOlevel>Level {lvl.level} {lvl.info}</LOlevel>
                      <ManageLevel target={lo} lvl={col}/>
                    </div>
                  </div>
                ))}
                <AddLevel target={lo}/>
              </div>
            }</Collapse>
            <AddLO/>
          </LOcard>
        ))}
      </div>
    </div>
  );
}


function AddLO(){
  const [show, setShow] = useState(false);
  const { register, handleSubmit } = useForm<{info: string, lvlInfo: string}>();
  async function addLO(data:any) {
    console.log(data.info, data.lvlInfo)
    await api.post<loRequest[]>('/lo', {courseID: cID, info: data.info});
    let res = await api.get<loResponse[]>('/los', {params: {courseID: cID} });
    let newLOID = res.data[res.data.length-1].loID;
    await api.post<loLevelRequest>('/lolevel', {loID: newLOID, level: 1, info: data.lvlInfo });
    alert(`New LO added`)
  }

  return(<div>
    <button className="floatbutton" onClick={() => setShow(true)} style={{position: "absolute", right: 25, bottom: 25}}>
      <i className="fa fa-plus"></i><br/> <span>New LO</span>
    </button>
    <Modal show={show} onHide={() => setShow(false)}>
      <form onSubmit={handleSubmit((data) => {
        addLO(data)
        setShow(false);
        window.location.reload();
      })}>
      <ModalHeader>
        <ModalTitle>Create a new Learning Outcome</ModalTitle>
      </ModalHeader>
        <ModalBody>
          <div>
            <label>LO Title</label><br/>
            <input type="text" {...register('info')} required 
              placeholder="LO0 New Outcome"/><br/>
            <label>Level 1 Title</label><br/>
            <input type="text" {...register('lvlInfo')} required placeholder="Hello World"/><br/>
            <p>(more level can be added later)</p>
          </div>
        </ModalBody>
      <ModalFooter>
      <input type="submit" value="Confirm"/>
      </ModalFooter>
      </form>
    </Modal>
  </div>
  )
}

function EditLO(props: {target: loResponse}) {
  const [show, setShow] = useState(false);
  return(<div>
    <EditButton className="fa fa-pencil" onClick={() => setShow(true)}></EditButton>
        <Modal show={show} onHide={() => setShow(false)}>
        <form>
          <ModalHeader>
            <ModalTitle>Manage Learning Outcome</ModalTitle>
          </ModalHeader>
            <ModalBody>
              <div>
                <h4>{props.target.info}</h4>
                <label>Edit Title</label><br/>
                <input type="text" required /><br/>
              </div>
            </ModalBody>
          <ModalFooter>
            <Button variant="danger"  onClick={() => {setShow(false);}}>Delete</Button>
            <Button variant="primary" onClick={() => {setShow(false);}}>Save</Button>
          </ModalFooter>
          </form>
        </Modal>
  </div>)
}

function AddLevel(props: {target: loResponse}) {
  const [show, setShow] = useState(false);
  const { register, handleSubmit, } = useForm<{ info: string }>();
  const newLevel: number = props.target.levels[props.target.levels.length-1].level + 1;
  async function addLevel(data:string) {
    await api.post<loLevelRequest>('/lolevel', {loID: props.target.loID, level: newLevel, info: data });
    alert(`New level added to ${props.target.info}`)
  }
  return(<div>
    <EditButton className="fa fa-plus" style={{fontSize: 18}} onClick={() => setShow(true)}></EditButton>
      <Modal show={show} onHide={() => setShow(false)}>
        <form onSubmit={handleSubmit((data) => {
          addLevel(data.info);
          setShow(false);
          window.location.reload();
        })}>
          <ModalHeader>
            <ModalTitle>Add new level</ModalTitle>
          </ModalHeader>
            <ModalBody>
              <div>
                <h5>Target LO : {props.target.info}</h5>
                <label style={{fontSize:20}}>New level title</label><br/>
                Level {newLevel} <input type="text" {...register('info')} required /><br/>
              </div>
            </ModalBody>
          <ModalFooter>
            <input type="submit" value="Confirm"/>
          </ModalFooter>
          </form>
        </Modal>
  </div>)
}

function ManageLevel(props:{target: loResponse, lvl: number}) {
  const [show, setShow] = useState(false);
  return(<div>
    <EditButton className="fa fa-pencil" style={{fontSize: 18}} onClick={() => setShow(true)}></EditButton>
    <Modal show={show} onHide={() => setShow(false)}>
      <form>
        <ModalHeader>
          <ModalTitle>Manage Level </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>
            <h4>Level {props.target.levels[props.lvl].level} {props.target.levels[props.lvl].info}</h4>
            <label>Edit Level Title</label><br/>
            <input type="text" required /><br/>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={() => {setShow(false);}}>Delete</Button>
          <Button variant="primary" onClick={() => {setShow(false);}}>Save</Button>
        </ModalFooter>
      </form>
    </Modal>
  </div>)
}

function LinkLOtoPLO(props:{target: loResponse}) { // move to edit lo
  const [show, setShow] = useState(false);
  const [program, _setProgram] = useState<programResponse>();
  const [plos, _setPlos] = useState<Array<ploResponse>>([]);
  const [check, _setCheck] = useState<Array<boolean>>([]);
  useEffect(() => {
      ( async () => {
        let res1 = await api.get<programResponse[]>('/programs');
        let res2 = (await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID}}));
        let res3 = await api.get<loResponse[]>('/los', {params: {courseID: res2.data[0].courseID} });
        let res4 = await api.get<ploResponse[]>('/plos', {params: {programID: res1.data[0].programID} });
        cID = res2.data[0].courseID
        _setProgram(res1.data[0]);
        _setPlos(res4.data);
        _setCheck(Array.from({length: res4.data.length}, () => false));
      }) ()
  },[])

  function handleCheck(i: number){
    check[i] = !check[i];
    console.log(check)
    _setCheck(check.slice());
  }
  async function linkToPLO() {
    for (let i = 0; i < check.length; i++) {
      if(check[i] === true){
        console.log("linked to ", plos[i].ploID)
      }
    }
    alert("Link success!");
  }

  return(<div>
    <EditIcon style={{right:"51.5%"}}><i className="fa fa-link" onClick={() => setShow(true)}></i></EditIcon>
    <Modal show={show} onHide={() => setShow(false)}>
    <form>
      <ModalHeader>
        <ModalTitle>Link LO to PLO</ModalTitle>
      </ModalHeader>
        <ModalBody>
          <div>
            <h5 style={{marginBottom:5}}>Target : {props.target.info}</h5>
            <h5 style={{borderBottom: "grey 0.5px solid", paddingBottom: 5}}>Program : {program?.programName}</h5>
            Select PLO to link to this LO
            {plos.map((plo, i) => (
              <CardDiv style={{border: 'none'}}>
                <div style={{display: "flex"}}>
                <LeftCheckbox checked={check[i]} onClick={() => handleCheck(i)} readOnly/>
                  <h6 style={{marginBottom: 3}}>
                    {plo.info}
                  </h6>
                </div>
              </CardDiv>
            ))}
          </div>
        </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={() => {linkToPLO(); setShow(false);}}>Save</Button>
      </ModalFooter>
      </form>
    </Modal>
  </div>)
}

export default LO;

const LOcard = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  margin-left: 30px;
  border-bottom: grey 2px solid;
`;

const LOlist = styled.h4`
  list-style-type: none;
  text-align: left;
  margin: 0px;
  padding-left: 0px;
  margin-top: -2px;
`;

const LOlevel = styled.p`
  margin-bottom: 0px;
  font-size: 18px;
`;

const EditButton = styled.i`
  position: absolute;
  right: 50%;
  text-align: center;
  font-size: 20px;
`;

//MangeLO
const RightButton = styled.i`
  position: absolute;
  right: 19px;
  text-align: center;
  font-size: 24px;

`;

const LevelRightButton = styled.i`
  position: absolute;
  right: 19px;
  text-align: center;
  font-size: 16px;
`;

