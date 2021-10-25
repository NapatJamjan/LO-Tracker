import React, { createContext, useState } from 'react';

export interface LODetail {
    id: string;
    courseID: string;
    name: string;
    level: Array<string>;
};

interface LOContent{
    los: Array<LODetail>;
    addLo:(loDetail: Omit<LODetail, 'id'>) => void;
    deleteLo:() => void;
    updateLo:(edittedLO:Array<LODetail>) => void;
};

export const LOContext = createContext<LOContent>({
    los: [],
    addLo: () => {},
    deleteLo: () => {},
    updateLo: () => {}
});

interface LOState {
    los: Array<LODetail>;
};

export const LOProvider: React.FC = ({children}) => {
    const [lo, setLo] = useState<LOState>({
        los: [{id: "0", courseID:'0', name: "LO 1 Describe and discuss fundamental data structures and the relevant algorithms", 
            level: ['Level 1 Know what is data structures','Level 2 Algorithms']},
        {id: "1", courseID:'0', name: "LO 2 Describe and discuss the use of built-in data structures.", 
            level: ['Level 1 Data Structure basic','Level 2 Various built-in DS','Level 3 How to']},
        {id: "2", courseID:'0', name: "LO 3 Apply knowledge of intelligent systems to the given computational problems.", 
            level: ['Level 1 Basic AI','Level 2 Fine tuning','Level 3 Deep Learning']},
    ]});
    const {los} = lo;
    const addLo = ({courseID, name, level}: Omit<LODetail, 'id'>) => {
        setLo({
            ...lo,
            los:[...lo.los, {
                id: `${lo.los.length+1}`,
                courseID,
                name,
                level
            }]
        })
    }
    const deleteLo = () => {};
    const updateLo = (edittedLO:Array<LODetail>) => {
        los.splice(0,los.length)
        los.push(...edittedLO)
        setLo({...lo})
        alert("Learning Outcome saved")
    };
    return(
        <LOContext.Provider value={{los, addLo, deleteLo, updateLo}}>
            {children}
        </LOContext.Provider>
    )

}