import { Link, navigate } from "gatsby";
import React, { useEffect } from "react";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";
import { initCourse } from "../../../../../shared/initialData";

const Course: React.FC<{courseID: string}> = ({courseID}) => {
  useEffect(() => {
    initCourse(courseID);
  }, [])
  return (<Layout>
    <CourseNav/>
    </Layout>
  );
}

export function CourseNav() {
  return(
      <ul style={{
        listStyleType: 'none',
        padding: '0',
        overflow: 'hidden',
        borderBottom: '1px black solid',
        justifyContent: 'start'
      }}>
        {[
          {path: 'quiz', title: 'Quiz'},
          {path: 'lo', title: 'Outcome'},
          {path: 'student', title: 'Student'},
          {path: 'dashboard', title: 'Dashboard'}
        ].map((value) => {
          return (
            <li style={{fontSize: '18px', paddingRight: '5%', display: 'inline-block'}} key={value.title}>
              <Link to={`./${value.path}`} style={{textAlign: 'center', textDecoration: 'none'}}>
                {value.title}
              </Link>
            </li>
          );
        })}
      </ul>
    
  )
}

export default Course;
