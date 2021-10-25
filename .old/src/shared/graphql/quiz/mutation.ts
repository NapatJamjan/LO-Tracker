import { gql } from '@apollo/client';

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

export interface CreateQuizModel {
  name: string;
  createdAt: Date;
  questions: CreateQuestionModel[];
};

export interface CreateQuestionModel {
  title: string;
  maxScore: number;
  results: CreateQuestionResultModel[];
};

export interface CreateQuestionResultModel {
  studentID: string;
  score: number;
};

export interface CreateQuizResponse {
  id: string;
};

export interface CreateQuestionLinkModel {
  questionID: string;
  loID: string;
  level: number;
};

export interface CreateQuestionLinkResponse {
  questionID: string;
  loID: string;
};

export interface DeleteQuizResponse {
  id: string;
};

export interface DeleteQuestionLinkModel {
  questionID: string;
  loID: string;
  level: number;
};

export interface DeleteQuestionLinkResponse {
  questionID: string;
  loID: string;
};
