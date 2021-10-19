import { gql } from '@apollo/client';

export const CREATE_PROGRAM = gql`
  mutation CreateProgram($input: CreateProgramInput!) {
    createProgram(input: $input) {
      id
      name
      description
    }
  }
`;

export const CREATE_PLOGROUP = gql`
  mutation CreatePLOGroup($programID: ID!, name: String!, $input: [CreatePLOsInput!]!) {
    createPLOGroup(programID: $programID, name: $name, input: $input) {
      id
      name
    }
  }
`;

export const CREATE_PLO = gql`
  mutation CreatePLO($ploGroupID: ID!, $input: CreatePLOInput!) {
    createPLO(input: $input) {
      id
      title
      description
      ploGroupID
    }
  }
`;

export const DELETE_PLOGROUP = gql`
  mutation DeletePLOGroup($id: ID!) {
    deletePLOGroup(id: $id) {
      id
    }
  }
`;

export const DELETE_PLO = gql`
  mutation DeletePLO($id: ID!) {
    deletePLO(id: $id) {
      id
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse($programID: ID!, $input: CreateCourseInput!) {
    createCourse(programID: $programID) {
      id
      name
      description
      semester
      year
      ploGroupID
    }
  }
`;

export const CREATE_LOS = gql`
  mutation CreateLOs($courseID: ID!, $input: [CreateLOsInput!]!) {
    createLOs(courseID: $courseID, input: $input) {
      id
    }
  }
`;

export const CREATE_LOLINK = gql`
  mutation CreateLOLink($loID: ID!, $ploID: ID!) {
    createLOLink(loID: $loID, ploID: $ploID) {
      loID
      ploID
    }
  }
`;

export const CREATE_LO = gql`
  mutation CreateLO($courseID: ID!, $input: CreateLOInput!) {
    createLO(courseID: $courseID, input: $input) {
      id
    }
  }
`;

export const CREATE_LOLEVEL = gql`
  mutation CreateLOLevel($loID: ID!, $input: CreateLOLevelInput!) {
    createLOLevel(loID: $loID, input: $input) {
      id
    }
  }
`;

export const DELETE_LO = gql`
  mutation DeleteLO($id: ID!) {
    deleteLO(id: $id) {
      id
    }
  }
`;

export const DELETE_LOLEVEL = gql`
  mutation DeleteLO($id: ID!, $level: Int!) {
    deleteLO(id: $id, level: $level) {
      id
    }
  }
`;

export const DELETE_LOLINK = gql`
  mutation DeleteLO($loID: ID!, $ploID: ID!) {
    deleteLO(loID: $loID, ploID: $ploID) {
      loID
      ploID
    }
  }
`;

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($courseID: ID!, $input: CreateQuizInput!) {
    createQuiz(courseID: $courseID, input: $input) {
      id
    }
  }
`;

export const CREATE_QUESTIONLINK = gql`
  mutation CreateQuestionLink($input: CreateQuestionLinkInput!) {
    createQuestionLink(input: $input) {
      questionID
      loID
    }
  }
`;

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id) {
      id
    }
  }
`;

export const DELETE_QUESTIONLINK = gql`
  mutation DeleteQuestionLink($input: DeleteQuestionLinkInput!) {
    deleteQuestionLink(input: $input) {
      questionID
      loID
    }
  }
`;
