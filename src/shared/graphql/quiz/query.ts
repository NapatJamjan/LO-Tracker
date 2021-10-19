import { gql } from '@apollo/client';

export const GET_QUIZZES = gql`
  query Quiz($courseID: ID!) {
    quiz(courseID: $courseID) {
      id
      name
      createdAt
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

export interface QuizModel {
  id: string;
  name: string;
  createdAt: number;
  questions: {
    id: string;
    title: string;
    maxScore: number;
    results: {
      studentID: string;
      score: number;
    }[];
    loLinks: {
      loID: string;
      level: number;
    }[];
  }[];
};
