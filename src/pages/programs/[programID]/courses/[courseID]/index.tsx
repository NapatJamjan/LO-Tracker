import { Link } from "gatsby";
import React from "react";
import Layout from "../../../../../components/layout";
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
        <Link to={`/programs/${programID}/courses`}>{programID}</Link>
        &nbsp;&#12297;&nbsp;
        <span>{courseID}</span>
      </p>
      <Link to="./quiz">Manage quiz</Link><br />
      <Link to="./lo">Manage lo</Link><br />
      <Link to="./student">Manage student</Link><br />
      <Link to="./dashboard">Manage dashboard</Link><br />
    </Layout>
  );
}

export default Course;
