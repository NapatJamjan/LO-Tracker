import axios from "axios";
import { Link } from "gatsby";
import React, { useEffect, useState } from "react";
import Layout from "../../../../../components/layout";
import { CourseNameLink, ProgramNameLink } from "../../../../../components/namebar";
import Seo from "../../../../../components/seo";

const Course: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const [courseDescription, setCourseDescription] = useState<string>('');
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<{courseDescription: string}>('/course-description', { params: { programID, courseID } })
      .then((res) => res.data.courseDescription)
      .then(setCourseDescription)
      .catch(JSON.stringify)
      .catch(console.log);
  }, []);
  return (
    <Layout>
      <Seo title="Course" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to={`/programs/${programID}/courses`} />
        &nbsp;&#12297;&nbsp;
        <CourseNameLink programID={programID} courseID={courseID} to="" />
      </p>
      <br/>
      <ul>
        <li><Link to="./lo">Manage LO</Link></li>
        <li><Link to="./student">Manage Student</Link></li>
        <li><Link to="./quiz">Manage Quiz</Link></li>
        <li><Link to="./dashboards">Dashboard</Link></li>
      </ul>
      <p className="mt-5">
        <span className="text-2xl">Course Description</span><br/>
        <span>{courseDescription}</span>
      </p>
    </Layout>
  );
}

export default Course;
