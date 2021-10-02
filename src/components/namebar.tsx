import axios from 'axios';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';

export const ProgramNameLink: React.FC<{programID: string, to: string}> = ({programID, to}) => {
  const [programName, setProgramName] = useState<string>(programID);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<{programName: string}>('/program-name', { params: { programID } })
      .then((res) => res.data.programName)
      .then(setProgramName)
      .catch(JSON.stringify)
      .catch(console.log);
  }, []);
  return (
    <Link to={to} style={{pointerEvents: (to === '' || to === '.')?'none':'auto'}}>{programName}</Link>
  );
}

export const CourseNameLink: React.FC<{programID: string, courseID: string, to: string}> = ({programID, courseID, to}) => {
  const [courseName, setCourseName] = useState<string>(courseID);
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<{courseName: string}>('/course-name', { params: { programID, courseID } })
      .then((res) => res.data.courseName)
      .then(setCourseName)
      .catch(JSON.stringify)
      .catch(console.log);
  }, []);
  return (
    <Link to={to} style={{pointerEvents: (to === '' || to === '.')?'none':'auto'}}>{courseName}</Link>
  );
}
