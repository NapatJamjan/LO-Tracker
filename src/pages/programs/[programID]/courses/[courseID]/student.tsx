import { Link } from 'gatsby';
import React from 'react';
import Layout from '../../../../../components/layout';
import Seo from '../../../../../components/seo';
import { CourseNameLink, ProgramNameLink } from '../../../../../components/namebar';
import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useQuery } from '@apollo/client';
import { StudentModel } from '../../../../../shared/graphql/course/query';

const Student: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const {data, loading} = useQuery<GetStudetsInCourseData, GetStudetsInCourseVars>(GET_STUDENTS_IN_COURSE, {variables: {courseID}});
  return (
    <Layout>
      <Seo title="Student" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
        &nbsp;&#12297;&nbsp;
        <CourseNameLink courseID={courseID} to="../" />
        &nbsp;&#12297;&nbsp;
        <span>Students</span>
      </p>
      <table className="table-auto mt-4">
        <thead>
          <tr className="bg-gray-100">
            <td className="text-center">Student ID</td>
            <td>Student Email</td>
            <td>Student Name</td>
            <td>Student Surname</td>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td className="text-center"></td><td>Loading...</td><td>Loading...</td><td>Loading...</td></tr>}
          {
            data && [...data.studentsInCourse].sort((s1, s2) => s1.id.localeCompare(s2.id)).map((student) => (
              <tr key={student.id}>
                <td className="text-center">{student.id}</td>
                <td>{student.email}</td>
                <td>{student.name}</td>
                <td>{student.surname}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </Layout>
  );
}

const ApolloStudent: React.FC<{programID: string, courseID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><Student programID={props.programID} courseID={props.courseID}/></ApolloProvider>
};

const GET_STUDENTS_IN_COURSE = gql`
  query StudentsInCourse($courseID: ID!) {
    studentsInCourse(courseID: $courseID) {
      id
      email
      name
      surname
    }
  }
`;

interface GetStudetsInCourseData {
  studentsInCourse: StudentModel[];
};

interface GetStudetsInCourseVars {
  courseID: string;
};

export default ApolloStudent;
