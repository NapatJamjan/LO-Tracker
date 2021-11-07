import Head from 'next/head';
import client from '../../../apollo-client';
import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { CourseSubMenu, KnownCourseMainMenu } from '../../../components/Menu';

interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
  programID: string;
};

interface PLOGroupModel {
  id: string;
  name: string;
};

export default ({course, ploGroups}: {course: CourseModel, ploGroups: PLOGroupModel[]}) => {
  return <div>
    <Head>
      <title>Course Settings</title>
    </Head>
    <KnownCourseMainMenu programID={course.programID} courseID={course.id} courseName={course.name}/>
    <CourseSubMenu courseID={course.id} selected={'settings'}/>
    <p className="mt-4 mb-2 underline">Course Settings</p>
    <div className="grid grid-cols-2 gap-4">
      <div>Name</div>
      <input type="text" placeholder="program's name" defaultValue={course.name} className="border-4 rounded-md p-1 text-sm"/>
      <div>Description</div>
      <textarea placeholder="program's description" defaultValue={course.description} cols={30} className="border-4 rounded-md p-2" rows={4}></textarea>
      <div>Semester</div>
      <select defaultValue={course.semester} className="border-4 rounded-md p-1 mx-2 text-sm">
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>S</option>
      </select>
      <div>Year</div>
      <select defaultValue={course.year} className="border-4 rounded-md p-1 mx-2 text-sm">
        {Array.from({ length: 10 }, (_, i) => 2021 - i).map((year) => (
          <option value={year} key={`year-${year}`}>
            {year}
          </option>
        ))}
      </select>
      <div>PLO Group</div>
      <select defaultValue={course.ploGroupID} className="border-4 rounded-md p-1 mx-2 text-sm">
        <option disabled value="">--Select PLO Group--</option>
        {[...ploGroups].sort((p1, p2) => p1.name.localeCompare(p2.name)).map((plo) => (
          <option value={plo.id} key={plo.id}>
            {plo.name}
          </option>
        ))}
      </select>
    </div>
    <div className="flex justify-end">
      <input type="submit" value="save" className="mt-3 py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg" onClick={() => alert('not implemented')}/>
    </div>
  </div>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<{course: CourseModel, ploGroups: PLOGroupModel[]}> = async (context) => {
  const { id: courseID } = context.params as Params;
  const {data: fetchCourse} = await client.query<{course: CourseModel}, {courseID: string}>({
    query: GET_COURSE,
    variables: {
      courseID
    }
  });
  const {data: fetchPLOGroups} = await client.query<{ploGroups: PLOGroupModel[]}, {programID: string}>({
    query: GET_PLOGROUPS,
    variables: {
      programID: fetchCourse.course.programID
    }
  });
  return {
    props: {
      course: fetchCourse.course,
      ploGroups: fetchPLOGroups.ploGroups
    }
  };
};

const GET_COURSE = gql`
  query CourseDetail($courseID: ID!) {
    course(courseID: $courseID) {
      id
      name
      description
      semester
      year
      ploGroupID
      programID
}}`;
const GET_PLOGROUPS = gql`
  query PLOGroups($programID: ID!) {
    ploGroups(programID: $programID) {
      id
      name
}}`;
