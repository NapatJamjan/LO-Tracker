import React from "react";
import Layout from "../../../../../components/layout";
import Seo from "../../../../../components/seo";

const Course: React.FC<{courseID: string}> = ({courseID}) => {
  return (
    <Layout>
      <Seo title="" />
      <p>{courseID}</p>
    </Layout>
  );
}

export default Course;
