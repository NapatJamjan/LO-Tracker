import { useQuery } from '@apollo/client';
import axios from 'axios';
import { Link } from 'gatsby';
import gql from 'graphql-tag';
import React, { useEffect, useState } from 'react';
import { CourseModel } from '../shared/graphql/course/query';
import { ProgramModel } from '../shared/graphql/program/query';

export const ProgramNameLink: React.FC<{programID: string, to: string}> = ({programID, to}) => {
  const {data, loading, error} = useQuery<{program: ProgramModel}, {programID: string}>(gql`
    query ProgramName($programID: ID!) {
      program(programID: $programID) {
        name
      }
    }
  `, {variables: {programID}});
  return (
    <Link to={to} style={{pointerEvents: (to === '' || to === '.')?'none':'auto'}}>
      {loading || error && <>{programID}</>}
      {data && <>{data.program.name}</>}
    </Link>
  );
}

export const CourseNameLink: React.FC<{courseID: string, to: string}> = ({courseID, to}) => {
  const {data, loading, error} = useQuery<{course: CourseModel}, {courseID: string}>(gql`
    query CourseName($courseID: ID!) {
      course(courseID: $courseID) {
        name
      }
    }
  `, {variables: {courseID}});
  return (
    <Link to={to} style={{pointerEvents: (to === '' || to === '.')?'none':'auto'}}>
      {loading || error && <>{courseID}</>}
      {data && <>{data.course.name}</>}
    </Link>
  );
}
