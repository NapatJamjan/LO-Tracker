import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetStaticProps, GetStaticPaths } from 'next';
import { ParsedUrlQuery } from 'querystring';
import ProgramAnchor from '../../../components/ProgramAnchor';
import ClientOnly from '../../../components/ClientOnly';
import { ProgramStaticPaths } from '../../../utils/staticpaths';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export default function Courses({programID, courses}: {programID: string, courses: CourseModel[]}) {
  const [filter, setFilter] = useState<string>('');
  return (<div>
    <Head>
      <title>Courses</title>
    </Head>
    <p>
      <Link href="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <Link href="/programs">Programs</Link>
      &nbsp;&#12297;&nbsp;
      <ClientOnly>
        <ProgramAnchor programID={programID} href=""/>
      </ClientOnly>
    </p>
    <p className="my-3">
      <span className="underline">Courses</span>
      <span className="mx-3"></span>
      <Link href={`/program/${programID}/plos`}>PLOs</Link>
    </p>
    <div className="flex justify-between items-end mt-4 mb-3">
      <input type="text" onChange={e => setFilter(e.target.value || '')} value={filter} placeholder="search for a program" className="border-4 rounded-md p-1 mx-2 text-sm"/>
      <Link href={`/program/${programID}/create-course`}><button className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm">
        Create a new course <span className="text-xl text-green-800">+</span>
      </button></Link>
    </div>
    <CourseList courses={courses} filter={filter}/>
  </div>);
};

function CourseList({courses, filter}: {courses: CourseModel[], filter: string}) {
  let courseGroups = new Map<string, CourseModel[]>();
  for (let i = 0; i < courses.length; ++i) {
    if (courses[i].name.search(new RegExp(filter, 'i')) === -1) continue;
    courseGroups.set(`${courses[i].semester},${courses[i].year}`, [...(courseGroups.get(`${courses[i].semester},${courses[i].year}`) || []), {...courses[i]}]);
  }
  return (<>{
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
                  <Link href={`/course/${course.id}`}>
                    {course.name}
                  </Link>
                </li>
              ))
            }
          </ul>
        </div>
      );
    })
  }</>);
}

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{programID: string, courses: CourseModel[]}> = async (context) => {
  const { id: programID } = context.params as Params;
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
  const { data } = await client.query<{courses: CourseModel[]}, {programID: string}>({
    query: GET_COURSES,
    variables: { programID }
  });
  return {
    props: {
      programID,
      courses: data.courses,
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths = ProgramStaticPaths;
