import React from 'react';
import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useMutation, useQuery } from "@apollo/client";
import { Link, navigate } from "gatsby";
import { useForm } from "react-hook-form";
import Layout from "../../../../components/layout";
import { ProgramNameLink } from "../../../../components/namebar";
import Seo from "../../../../components/seo";
import { CreateCourseModel, CreateCourseResponse } from "../../../../shared/graphql/course/mutation";
import { PLOGroupModel } from "../../../../shared/graphql/program/query";

const CreateCourse: React.FC<{ programID: string }> = ({ programID }) => {
  const ploGroupResponse = useQuery<GetPLOGroupsData, GetPLOGroupsVars>(GET_PLOGROUPS, {variables: {programID}});
  const [createCourse, { loading } ] = useMutation<CreateCourseData, CreateCourseVars>(CREATE_COURSE);
  const { register, handleSubmit, reset, formState: {errors, touchedFields} } = useForm<CreateCourseModel>();
  const submitForm = (form: CreateCourseModel) => {
    if (form.name !== '' && form.ploGroupID !== '') {
      createCourse({
        variables: {
          programID,
          input: form
        }
      }).then((res) => {
        reset({name: ''});
        navigate(`../${res.data.createCourse.id}`);
      });
    }
  }
  return (
    <Layout>
      <Seo title="PLOs' Program" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <ProgramNameLink programID={programID} to=".."/>
        &nbsp;&#12297;&nbsp;
        <span>Create a new course</span>
      </p>
      {ploGroupResponse.loading && <p>Loading...</p>}
      <p>{JSON.stringify(ploGroupResponse.error)}</p>
      {ploGroupResponse.data && <div>
        <form onSubmit={handleSubmit((form) => loading? null: submitForm(form))}>
          <span>Course name:</span>
          <br />
          <input {...register('name', {required: true})} className="border-4 rounded-md p-1 mx-2 text-sm"/>
          <br />
          <span className="text-red-500 text-sm italic pl-3">{touchedFields.name && errors.name && 'Course name is required.'}</span><br/>

          <span>Course description:</span>
          <br />
          <textarea {...register('description')} placeholder="program's description" cols={30} className="border-4 rounded-md p-1 mx-2" rows={4}></textarea>
          <br />

          <span>Semester:</span>
          <br />
          <select {...register('semester')} className="border-4 rounded-md p-1 mx-2 text-sm">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>S</option>
          </select>
          <br />

          <span>Year:</span>
          <br />
          <select {...register('year')} className="border-4 rounded-md p-1 mx-2 text-sm">
            {Array.from({ length: 10 }, (_, i) => 2021 - i).map((year) => (
              <option value={year} key={`year-${year}`}>
                {year}
              </option>
            ))}
          </select>
          <br />

          <span>PLO Group:</span>
          <select {...register('ploGroupID')} className="border-4 rounded-md p-1 mx-2 text-sm" defaultValue="">
            <option disabled value="">--Select PLO Group--</option>
            {[...ploGroupResponse.data.ploGroups].sort((p1, p2) => p1.name.localeCompare(p2.name)).map((plo) => (
              <option value={plo.id} key={plo.id}>
                {plo.name}
              </option>
            ))}
          </select>
          <br />
          <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
        </form>
      </div>}
    </Layout>
  );
};

const ApolloCreateCourse: React.FC<{programID: string}> = (props) => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><CreateCourse programID={props.programID}/></ApolloProvider>
};

const GET_PLOGROUPS = gql`
  query PLOGroups($programID: ID!) {
    ploGroups(programID: $programID) {
      id
      name
    }
  }
`;

interface GetPLOGroupsData {
  ploGroups: PLOGroupModel[];
};

interface GetPLOGroupsVars {
  programID: string;
};

const CREATE_COURSE = gql`
  mutation CreateCourse($programID: ID!, $input: CreateCourseInput!) {
    createCourse(programID: $programID, input: $input) {
      id
      name
      description
      semester
      year
      ploGroupID
    }
  }
`;

interface CreateCourseData {
  createCourse: CreateCourseResponse;
};

interface CreateCourseVars {
  programID: string;
  input: CreateCourseModel
};

export default ApolloCreateCourse;
