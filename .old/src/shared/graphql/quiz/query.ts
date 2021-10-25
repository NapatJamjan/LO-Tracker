import { gql } from '@apollo/client';

export const GET_QUIZZES = gql`
  query Quizzes($courseID: ID!) {
    quizzes(courseID: $courseID) {
      id
      name
      createdAt
      questions {
        id
        title
        maxScore
        loLinks {
          loID
          level
          description
        }
      }
    }
  }
`;

export interface QuizModel {
  id: string;
  name: string;
  createdAt: number;
  questions: QuestionModel[];
};

export interface QuestionModel {
  id: string;
  title: string;
  maxScore: number;
  results: {
    studentID: string;
    score: number;
  }[];
  loLinks: QuestionLinkModel[];
};

export interface QuestionLinkModel {
  loID: string;
  level: number;
  description: string;
};
