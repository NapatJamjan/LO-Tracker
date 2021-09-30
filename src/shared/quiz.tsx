import React, { createContext, useState } from 'react';

interface QuizDetail {
    id: string;
    name: string;
    question: Array<QuestionDetail>;
}

export interface QuestionDetail {
    name: string;
    maxscore: number;
    linkedLO: Array<LinkedLO>;
}

export interface LinkedLO {
    loID: string;
    lvl: Array<number>;
}

interface LinkingLO {
    los: Array<LinkedLO>;
    quizID: string;
    questionIndex: number;
}

interface QuizContent{
    quizzes: Array<QuizDetail>;
    addQuiz: (quizDetail: Omit<QuizDetail, 'id'>) => void;
    linkLO: (linkingdata: Omit<LinkingLO, 'id'>) => void;
}

export const QuizContext = createContext<QuizContent>({
    quizzes: [],
    addQuiz: () => {},
    linkLO: () => {}
})

interface QuizState{
    quizzes: Array<QuizDetail>;
}

export const QuizProvider:React.FC = ({children}) =>{   
    const [quiz,setQuiz] = useState<QuizState>({quizzes: [
        {id: "0", name:"Quiz 1 : Tutorial Quiz",
        question: [{name: 'Question 1 Test Question', maxscore: 10, linkedLO: [{loID:' 1',lvl: [1, 2]}]} ,
            {name: 'Question 2 What is Computer Science about?', maxscore: 5, linkedLO: []}, 
            {name: 'Question 3 How to write a program?', maxscore: 10, linkedLO: [{loID: '1',lvl: [1, 2]}, {loID: '2', lvl: [3]}]}],
        },
        {id: "1", name: "Quiz 2 : Tutorial Quiz 2",
        question:[{name: 'Question 1 Test Question2', maxscore: 10, linkedLO: []} ,
            {name: 'Question 2 How to print Hello World in python', maxscore: 5, linkedLO: [{loID: '0', lvl: [1]}]}, 
            {name: 'Question 3 How to ', maxscore: 1, linkedLO: []}],
        }
    ]});
    const {quizzes} = quiz;
    const addQuiz = ({name, question}: Omit<QuizDetail, 'id'>) =>{
        setQuiz({
            ...quiz,
            quizzes:[...quiz.quizzes, {
                id: `${quiz.quizzes.length}`,
                name,
                question, 
            }]
        })
    };
    const linkLO = ({los, quizID, questionIndex}: Omit<LinkingLO, 'id'>) => {
        let targetQuiz = quizzes[parseInt(quizID)]
        if(questionIndex === -1){
            for (let i = 0; i < targetQuiz.question.length; i++) {
                targetQuiz.question[i].linkedLO = [...los];
            }
            alert(`Link the selected LO to quiz ${parseInt(quizID)+1}`)
        }
        else{
            targetQuiz.question[questionIndex].linkedLO = [...los];
            alert(`Link the selected LO to quiz ${parseInt(quizID)+1} question ${questionIndex+1}`)
        }
        console.log(targetQuiz)
       setQuiz({ ...quiz })
    }

    return(
        <QuizContext.Provider value={{quizzes, addQuiz, linkLO}}>
            {children}
        </QuizContext.Provider>
    )
}
