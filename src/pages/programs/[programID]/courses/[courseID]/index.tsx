import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useQuery } from "@apollo/client";
import { Link } from "gatsby";
import React from "react";
import Layout from "../../../../../components/layout";
import { CourseNameLink, ProgramNameLink } from "../../../../../components/namebar";
import Seo from "../../../../../components/seo";
import { CourseModel } from "../../../../../shared/graphql/course/query";

const Course: React.FC<{programID: string, courseID: string}> = ({programID, courseID}) => {
  const {data} = useQuery<{course: CourseModel}, {courseID: string}>(gql`
    query CourseDescription($courseID: ID!) {
      course(courseID: $courseID) {
        description
      }
    }
  `, {variables: {courseID}});
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
        <CourseNameLink courseID={courseID} to="" />
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
        <span>{data && data.course.description}</span>
      </p>
    </Layout>
  );
};

const ApolloCourse: React.FC<{programID: string, courseID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><Course programID={props.programID} courseID={props.courseID}/></ApolloProvider>
};

export default ApolloCourse;
