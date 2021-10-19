import { gql } from '@apollo/client';

export const GET_PROGRAMS = gql`
  query Programs {
    programs {
    id
    name
    description
    }
  }
`;

export const GET_PLOGROUPS = gql`
  query PLOGroups($programID: String!) {
    ploGroups(programID: $programID) {
      id
      name
    }
  }
`;

export const GET_PLOS = gql`
  query PLOs($ploGroupID: String!) {
    plos(ploGroupID: $ploGroupID) {
      id
      title
      description
      ploGroupID
    }
  }
`;

export const GET_COURSES = gql`
  query Courses($programID: String!) {
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
  query Course($courseID: String!) {
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
  query LOs($courseID: String!) {
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

export const GET_QUIZZES = gql`
  query Quiz($courseID: String!) {
    quiz(courseID: $courseID) {
      id
      name
      createAt
      questions {
        id
        title
        maxScore
        results {
          studentID
          score
        }
        loLinks {
          loID
          level
        }
      }
    }
  }
`;
