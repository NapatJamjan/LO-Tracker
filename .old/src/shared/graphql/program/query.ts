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
  query PLOGroups($programID: ID!) {
    ploGroups(programID: $programID) {
      id
      name
    }
  }
`;

export const GET_PLOS = gql`
  query PLOs($ploGroupID: ID!) {
    plos(ploGroupID: $ploGroupID) {
      id
      title
      description
      ploGroupID
    }
  }
`;

export interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export interface PLOGroupModel {
  id: string;
  name: string;
};

export interface PLOModel {
  id: string;
  title: string;
  description: string;
  ploGroupID: string;
};
