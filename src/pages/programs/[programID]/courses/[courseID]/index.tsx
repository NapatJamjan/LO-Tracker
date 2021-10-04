import { Link } from "gatsby";
import React from "react";
import Layout from "../../../../../components/layout";
import { CourseNameLink, ProgramNameLink } from "../../../../../components/namebar";
import Seo from "../../../../../components/seo";

const Course: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
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
      <Link to="./quiz">Manage quiz</Link><br />
      <Link to="./lo">Manage LO</Link><br />
      <Link to="./student">Manage student</Link><br />
      <Link to="./dashboards">Dashboard</Link><br />
    </Layout>
  );
}

export default Course;
