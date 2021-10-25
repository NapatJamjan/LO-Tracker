import { gql } from '@apollo/client';

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
  mutation DeleteLOLevel($id: ID!, $level: Int!) {
    deleteLOLevel(id: $id, level: $level) {
      id
    }
  }
`;

export const DELETE_LOLINK = gql`
  mutation DeleteLOLink($loID: ID!, $ploID: ID!) {
    deleteLOLink(loID: $loID, ploID: $ploID) {
      loID
      ploID
    }
  }
`;

export interface CreateCourseModel {
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export interface CreateCourseResponse {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export interface CreateLOsModel {
  title: string;
  levels: {
    level: number;
    description: number;
  }[];
};

export interface CreateLOModel {
  title: string;
  level: number;
  description: string;
};

export interface CreateLOLinkResponse {
  loID: string;
  ploID: string;
};

export interface CreateLOLevelModel {
  level: number;
  description: string;
};

export interface CreateLOLevelResponse {
  id: string;
};

export interface CreateLOResponse {
  id: string;
};

export interface DeleteLOResponse {
  id: string;
};

export interface DeleteLOLevelResponse {
  id: string;
};

export interface DeleteLOLinkResponse {
  loID: string;
  ploID: string;
};
