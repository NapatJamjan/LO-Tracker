import axios from "axios";

export interface programResponse {
    programID: string;
    userID: string;
    programName: string;
    description: string;
}
export interface programRequest {
    name: string;
}

interface courseParams {
    programID: string;
}
export interface courseResponse {
    courseID: string;
    courseName: string;
    semester: number;
    year: number;
}
export interface courseRequest {
    programID: string;
    name: string;
    semester: number;
    year: number;
}

interface studentParams {
    courseID: string;
}
export interface studentResponse {
    studentID: string;
    studentName: string;
}
export interface studentRequest {
    courseID: string;
    students: {
      studentID: string;
      studentName: string;
    }
}

interface ploParams {
    programID: string;
}
export interface ploResponse {
    ploID: string;
    info: string;
    version: number;
}
export interface ploRequest {
    programID: string;
    info: string
}

interface loParams {
    courseID: string;
}
export interface loResponse {
    loID: string;
    info: string;
    levels: Array<{
      level: number;
      info: string;
    }>
}
export interface loRequest {
    courseID: string;
    info: string;
}
export interface loLevelRequest {
    loID: string;
    level: number;
    info: string;
}

export interface ploLinkRequest {
    ploID: string;
    loID: string;
}
export interface courseRequest2 {
    name: string;
    semester: number;
    year: number;
}
//http://localhost:5000/api/programs
export async function initData(){ // called on App.tsx
    const api = axios.create({baseURL: `http://localhost:5000/api`}); 
    let res1 = await api.get<programResponse[]>('/programs');
    try {
        if(res1.data.length === 0){
            await api.post<programRequest[]>('/program', {name: "Computer Science"})
            await api.post<programRequest[]>('/program', {name: "I.T."})
            let res1 = await api.get<programResponse[]>('/programs');
            console.log(res1);
            
            //course
            await api.post<courseRequest[]>('/course', {programID: res1.data[0].programID, 
                name: "CSC209: Data Structures", semester: 1, year: 2021});
            await api.post<courseRequest[]>('/course', {programID: res1.data[0].programID, 
                name: "CSC218: Database Systems", semester: 1, year: 2021});
            await api.post<courseRequest[]>('/course', {programID: res1.data[0].programID, 
                name: "CSC340: Artificial Intelligence", semester: 1, year: 2020});
            let res2 = await api.get<courseResponse[]>('/courses', {params: {programID: res1.data[0].programID} });
            console.log(res2);
            
            //student
            await api.post<studentRequest[]>('/students', {courseID: res2.data[0].courseID, students: 
                [{studentID: "61130500201", studentName: "Molthisok Choosak"},
                {studentID: "61130500203", studentName: "Vanida Ornwimol"},
                {studentID: "61130500206", studentName: "Charuphat Chindaworrasate"},
                {studentID: "61130500208", studentName: "Nuttawat Promsuk"},
                {studentID: "61130500210", studentName: "Tawan Vongsombun"},
                {studentID: "61130500212", studentName: "Tanadon Saydoung"},
                {studentID: "61130500234", studentName: "Kongphob Wongwaigitwatana"},
                {studentID: "61130500255", studentName: "Chirayu Phromchan"},
                ]});
            let res3 = await api.get<studentResponse[]>('/students', {params: {courseID: res2.data[0].courseID} });
            console.log(res3);

            //plo
            await api.post<ploRequest[]>('/plo', {programID: res1.data[0].programID, 
                info: "PLO1 An ability to apply knowledge of computer sciences appropriate to the discipline"});
            await api.post<ploRequest[]>('/plo', {programID: res1.data[0].programID, 
                info: "PLO2 An ability to use appropriate system design notations and apply software"+ 
                "engineering process in order to plan, design, and implement software systems of varying complexity."});
            await api.post<ploRequest[]>('/plo', {programID: res1.data[0].programID, 
                info: "PLO3 An ability to initiate innovation for computing applications."});
            let res4 = await api.get<ploResponse[]>('/plos', {params: {programID: res1.data[0].programID} });
            console.log(res4);

            //lo and lo level
            await api.post<loRequest[]>('/lo', {courseID: res2.data[0].courseID, 
                info: "LO1 Describe and discuss fundamental data structures and the relevant algorithms"});
            await api.post<loRequest[]>('/lo', {courseID: res2.data[0].courseID, 
                info: "LO2 Describe and discuss the use of built-in data structures."});
            await api.post<loRequest[]>('/lo', {courseID: res2.data[0].courseID, 
                info: "LO3 Choose and use built-in data structures in order to support the analysis and identification of problems."});
            await api.post<loRequest[]>('/lo', {courseID: res2.data[0].courseID, 
                info: "LO4 Implement, test, debug and evaluate simple algorithms on the data structures."});    
            let res5 = await api.get<loResponse[]>('/los', {params: {courseID: res2.data[0].courseID} });
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[0].loID, level: 1, info: "Test Level" });
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[0].loID, level: 2, info: "Test Level2"});
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[1].loID, level: 1, info: "Tutorial"});
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[1].loID, level: 2, info: "Hello World"});
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[1].loID, level: 3, info: "Advanced Programming"});
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[2].loID, level: 1, info: "Analyse simple problem"});
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[2].loID, level: 2, 
                info: "Identifies a possible future problem"});
            await api.post<loLevelRequest>('/lolevel', {loID: res5.data[3].loID, level: 1, info: "Debug a simple code"});
            res5 = await api.get<loResponse[]>('/los', {params: {courseID: res2.data[0].courseID} });
            console.log(res5)

            //quiz
        }      
        
    } catch(error) {
      console.log(error)
    }
}

export async function initCourse(cID: string){
    console.log(cID)
    const api = axios.create({baseURL: `http://localhost:5000/api`}); 
    let res3 = await api.get<studentResponse[]>('/students', {params: {courseID: cID} });
    console.log(res3);
    if(res3.data.length === 0){
    await api.post<studentRequest[]>('/students', {courseID: cID, students: 
        [{studentID: "61130500201", studentName: "Molthisok Choosak"},
        {studentID: "61130500203", studentName: "Vanida Ornwimol"},
        {studentID: "61130500206", studentName: "Charuphat Chindaworrasate"},
        {studentID: "61130500208", studentName: "Nuttawat Promsuk"},
        {studentID: "61130500210", studentName: "Tawan Vongsombun"},
        {studentID: "61130500212", studentName: "Tanadon Saydoung"},
        {studentID: "61130500234", studentName: "Kongphob Wongwaigitwatana"},
        {studentID: "61130500255", studentName: "Chirayu Phromchan"},
        ]});
    // await api.post<loRequest[]>('/lo', {courseID: cID, 
    //     info: "LO1 Describe and discuss fundamental data structures and the relevant algorithms"});
    // console.log("check 1")
    // await api.post<loRequest[]>('/lo', {courseID: cID, 
    //     info: "LO2 Describe and discuss the use of built-in data structures."});
    // await api.post<loRequest[]>('/lo', {courseID: cID, 
    //     info: "LO3 Choose and use built-in data structures in order to support the analysis and identification of problems."});
    // await api.post<loRequest[]>('/lo', {courseID: cID, 
    //     info: "LO4 Implement, test, debug and evaluate simple algorithms on the data structures."});    
    // let res5 = await api.get<loResponse[]>('/los', {params: {courseID: cID} });
    // console.log(res5.data)
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[0].loID, level: 1, info: "Test Level" });
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[0].loID, level: 2, info: "Test Level2"});
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[1].loID, level: 1, info: "Tutorial"});
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[1].loID, level: 2, info: "Hello World"});
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[1].loID, level: 3, info: "Advanced Programming"});
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[2].loID, level: 1, info: "Analyse simple problem"});
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[2].loID, level: 2, 
    //     info: "Identifies a possible future problem"});
    // await api.post<loLevelRequest>('/lolevel', {loID: res5.data[3].loID, level: 1, info: "Debug a simple code"});
    // res5 = await api.get<loResponse[]>('/los', {params: {courseID: cID} });
    // console.log(res5)
    }
}