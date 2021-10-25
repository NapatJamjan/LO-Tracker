import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useQuery } from '@apollo/client';
import { Link, navigate } from 'gatsby';
import React, { useState } from 'react';
import Layout from '../../../../components/layout';
import { ProgramNameLink } from '../../../../components/namebar';
import Seo from '../../../../components/seo';
import { CourseModel } from '../../../../shared/graphql/course/query';

const Courses: React.FC<{ programID: string }> = ({ programID }) => {
  const { data, loading } = useQuery<GetCoursesData, GetCoursesVars>(GET_COURSES, {variables: { programID }});
  const [filter, setFilter] = useState<string>('');
  let courses: CourseModel[] = [];
  if (data) {
    courses = [...data.courses];
  }
  let courseGroups = new Map<string, CourseModel[]>();
  for (let i = 0; i < courses.length; ++i) {
    if (courses[i].name.search(new RegExp(filter, 'i')) === -1) continue;
    courseGroups.set(`${courses[i].semester},${courses[i].year}`, [...(courseGroups.get(`${courses[i].semester},${courses[i].year}`) || []), {...courses[i]}]);
  }
  return (
    <Layout>
      <Seo title="Courses" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to="" />
      </p>
      <p className="my-3">
        <span className="underline">Courses</span>
        <span className="mx-3"></span>
        <Link to="../plo">PLOs</Link>
      </p>
      <div className="flex justify-between items-end mt-4 mb-3">
        <input type="text" onChange={e => setFilter(e.target.value || '')} value={filter} placeholder="search for a program" className="border-4 rounded-md p-1 mx-2 text-sm"/>
        <button onClick={() => navigate('./create')} className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
          Create a new course <span className="text-xl text-green-800">+</span>
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {
        Array.from(courseGroups).sort((group1, group2) => {
          let [sem1, year1] = group1[0].split(',').map(val => parseInt(val, 10));
          let [sem2, year2] = group2[0].split(',').map(val => parseInt(val, 10));
          if (year1 === year2) return sem2 - sem1;
          return year2 - year1;
        }).map((group) => {
          let [semester, year] = group[0].split(',').map(val => parseInt(val, 10));
          let courseList: CourseModel[] = group[1];
          return (
            <div key={`group-${group[0]}`}>
              <h3 style={{textAlign:'left'}}>Semester {semester === 3 ? 'S' : semester}/{year}</h3>
              <ul className="courselist">
                {
                  courseList.sort((course1, course2) => {
                    if (course1.year !== course2.year) return course2.year - course1.year;
                    if (course1.semester !== course2.semester) return course2.semester - course1.semester;
                    return course1.name.localeCompare(course2.name);
                  }).map((course) => (
                    <li key={course.id} className="rounded shadow-lg p-3">
                      <Link to={`./${course.id}`}>
                        {course.name}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </div>
          );
        })
      }
    </Layout>
  );
};

const ApolloCourses: React.FC<{programID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><Courses programID={props.programID}/></ApolloProvider>
};

const GET_COURSES = gql`
  query Courses($programID: ID!) {
    courses(programID: $programID) {
      id
      name
      description
      semester
      year
      ploGroupID
    }
  }
`;

interface GetCoursesData {
  courses: CourseModel[];
};

interface GetCoursesVars {
  programID: string;
};

export default ApolloCourses;
