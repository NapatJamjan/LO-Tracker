import Head from 'next/head';
import Link from 'next/link';
import { useState, createContext, useContext } from 'react';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticProps, GetStaticPaths } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { ProgramStaticPaths } from '../../../utils/staticpaths';
import { ProgramMainMenu, ProgramSubMenu } from '../../../components/Menu';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

const FilterContext = createContext<{filter: string, changeFilter: (string) => any}>({filter: '', changeFilter: (s) => {}});

export default ({programID, courses}: {programID: string, courses: CourseModel[]}) => {
  const [filter, setFilter] = useState<string>('');
  return (<FilterContext.Provider value={{filter, changeFilter: payload => setFilter(payload)}}>
    <Head>
      <title>Courses</title>
    </Head>
    <ProgramMainMenu programID={programID} />
    <ProgramSubMenu programID={programID} selected={'courses'}/>
    <div className="flex justify-between items-end mt-4 mb-3">
      <FilterTextField/>
      <Link href={`/program/${programID}/create-course`}><button className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new course <span className="text-xl text-green-800">+</span>
      </button></Link>
    </div>
    <FilterOwner/>
    <Courses courses={courses}/>
  </FilterContext.Provider>);
};

function FilterTextField() {
  const { changeFilter } = useContext(FilterContext);
  return <input type="text" onChange={e => changeFilter(e.target.value || '')} placeholder="search for a course" className="border-4 rounded-md p-1 mx-2 text-sm"/>;
}

function FilterOwner() {
  const [checked, setChecked] = useState<boolean>(false)
  return <div onClick={() => setChecked(!checked)} className="cursor-pointer">
    <input type="checkbox" defaultChecked={checked} className="border-4 rounded-md mr-2"/>
    <span>Show only my courses</span>
  </div>;
}

function Courses({courses}: {courses: CourseModel[]}) {
  const { filter } = useContext(FilterContext);
  let courseGroups = new Map<string, CourseModel[]>();
  for (let i = 0; i < courses.length; ++i) {
    if (courses[i].name.search(new RegExp(filter, 'i')) === -1) continue;
    let groupName: string = `${courses[i].semester},${courses[i].year}`;
    courseGroups.set(groupName, [...(courseGroups.get(groupName) || []), {...courses[i]}]);
  }
  if (courseGroups.size === 0) return <p>No course available</p>;
  return <>{
    Array.from(courseGroups).sort((group1, group2) => {
      let [sem1, year1] = group1[0].split(',').map(val => parseInt(val, 10));
      let [sem2, year2] = group2[0].split(',').map(val => parseInt(val, 10));
      if (year1 === year2) return sem2 - sem1;
      return year2 - year1;
    }).map((group) => {
      let [semester, year] = group[0].split(',').map(val => parseInt(val, 10));
      let filteredCourses: CourseModel[] = group[1];
      return <CourseSection key={`group-${group[0]}`} courses={filteredCourses} semester={semester} year={year}/>;
    })
  }</>;
}

function CourseSection({courses, semester, year}: {courses: CourseModel[], semester: number, year: number}) {
  return <div className="my-4">
    <h3 className="text-left mb-2">Semester {semester === 3? 'S': semester}/{year}</h3>
    <ul className="courselist">
      {courses.sort((c1, c2) => {
        if (c1.year !== c2.year) return c2.year - c1.year;
        if (c1.semester !== c2.semester) return c2.semester - c1.semester;
        return c1.name.localeCompare(c2.name);
      }).map(course => <Course key={course.id} course={course}/>)}
    </ul>
  </div>;
}

function Course({course}: {course: CourseModel}) {
  return <li className="rounded shadow-lg p-3">
    <Link href={`/course/${course.id}`}>
      {course.name}
    </Link>
  </li>;
}

interface PageParams extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{programID: string, courses: CourseModel[]}> = async (context) => {
  const { id: programID } = context.params as PageParams;
  const { data } = await client.query<{courses: CourseModel[]}, {programID: string}>({
    query: GET_COURSES, variables: { programID }
  });
  return {
    props: {
      programID,
      courses: data.courses,
    },
    revalidate: 30,
  };
};

export const getStaticPaths: GetStaticPaths = ProgramStaticPaths;

const GET_COURSES = gql`
  query Courses($programID: ID!) {
    courses(programID: $programID) {
      id
      name
      description
      semester
      year
      ploGroupID
}}`;
