import Link from 'next/link';
import { useState, useEffect } from 'react';
import client from '../apollo-client';
import { gql } from '@apollo/client';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
  teacherID: string;
};

export function ProgramNameLink({programID, href, callback}: {programID: string, href: string, callback?: (p: ProgramModel) => any}) {
  const [name, setName] = useState<string>('');
  useEffect(() => {
    if (!programID) return;
    (async() => {
      const {data, error} = await client.query<{program: ProgramModel}, {programID: string}>({
        query: gql`
          query ProgramName($programID: ID!) {
            program(programID: $programID) {
              name
              teacherID
            }
          }
        `,
        variables: {programID}
      });
      if (!error) setName(data.program.name);
      if (!error && callback) callback(data.program);
    })()
  }, [programID]);
  return <Link href={href}>
    {name}
  </Link>;
};

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export function CourseNameLink({courseID, href}: {courseID: string, href: string}) {
  const [name, setName] = useState<string>('');
  useEffect(() => {
    if (!courseID) return;
    (async() => {
      const {data, error} = await client.query<{course: CourseModel}, {courseID: string}>({
        query: gql`
          query CourseName($courseID: ID!) {
            course(courseID: $courseID) {
              name
            }
          }
        `,
        variables: {courseID}
      });
      if (!error) setName(data.course.name);
    })()
  }, [courseID]);
  return <Link href={href}>
    {name}
  </Link>;
};
