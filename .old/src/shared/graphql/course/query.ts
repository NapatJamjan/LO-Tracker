import { gql } from '@apollo/client';

export const GET_COURSES = gql`
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

export const GET_COURSE = gql`
  query Course($courseID: ID!) {
    course(courseID: $courseID) {
      id
      name
      description
      semester
      year
      ploGroupID
    }
  }
`;

export const GET_LOS = gql`
  query LOs($courseID: ID!) {
    los(courseID: $courseID) {
      id
      title
      levels {
        level
        description
      }
      ploLinks {
        id
        title
        description
        ploGroupID
      }
    }
  }
`;

export const GET_STUDENTS_IN_COURSE = gql`
  quey StudentsInCourse($courseID: ID!) {
    studentsInCourse(courseID: $courseID) {
      id
      email
      name
      surname
    }
  }
`;

export interface CourseModel {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export interface LOModel {
  id: string;
  title: string;
  levels: {
    level: number;
    description: string;
  }[];
  ploLinks: {
    id: string;
    title: string;
    description: string;
    ploGroupID: string;
  }[];
};

export interface StudentModel {
  id: string;
  email: string;
  name: string;
  surname: string;
};
