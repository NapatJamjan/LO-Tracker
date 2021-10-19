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
    createPLO(ploGroupID: $ploGroupID, input: $input) {
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

export interface CreateProgramModel {
  name: string;
  description: string;
};

export interface CreateProgramRepsonse {
  id: string;
  name: string;
  description: string;
};

export interface CreatePLOModel {
  title: string;
  description: string;
};

export interface CreatePLOGroupResponse {
  id: string;
  name: string;
};

export interface CreatePLOResponse {
  id: string;
  title: string;
  description: string;
  ploGroupID: string;
};

export interface DeletePLOGroupResponse {
  id: string;
};

export interface DeletePLOResponse {
  id: string;
};
