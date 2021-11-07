import Link from 'next/link';
import { gql, useQuery } from "@apollo/client";

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export function ProgramNameLink({programID, href}: {programID: string, href: string}) {
  const {data, loading, error} = useQuery<{program: ProgramModel}, {programID: string}>(gql`
    query ProgramName($programID: ID!) {
      program(programID: $programID) {
        name
      }
    }
  `, {variables: {programID}});
  if (loading || error) return (<span>{programID}</span>);
  return (<Link href={href}>
    {data.program.name}
  </Link>);
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
  const {data, loading, error} = useQuery<{course: CourseModel}, {courseID: string}>(gql`
    query CourseName($courseID: ID!) {
      course(courseID: $courseID) {
        name
      }
    }
  `, {variables: {courseID}});
  if (loading || error) return (<span>{courseID}</span>);
  return (<Link href={href}>
    {data.course.name}
  </Link>);
};
