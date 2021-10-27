import Head from 'next/head';
import Link from 'next/link';
import client from '../../../apollo-client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import ClientOnly from '../../../components/ClientOnly';
import ProgramAnchor from '../../../components/ProgramAnchor';
import { ProgramStaticPaths } from '../../../utils/staticpaths';

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

interface PLOGroupModel {
  id: string;
  name: string;
};

interface CreateCourseModel {
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

interface CreateCourseResponse {
  id: string;
  name: string;
  description: string;
  semester: number;
  year: number;
  ploGroupID: string;
};

export default function CreateCourse({programID}: {programID: string}) {
  const GET_PLOGROUPS = gql`
    query PLOGroups($programID: ID!) {
      ploGroups(programID: $programID) {
        id
        name
      }
    }
  `;
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
  const ploGroupResponse = useQuery<{ploGroups: PLOGroupModel[]}, {programID: string}>(GET_PLOGROUPS, {variables: {programID}});
  const [createCourse, { loading } ] = useMutation<{createCourse: CreateCourseResponse}, {programID: string, input: CreateCourseModel}>(CREATE_COURSE);
  const { register, handleSubmit, reset, formState: {errors, touchedFields} } = useForm<CreateCourseModel>();
  const router = useRouter();
  const submitForm = (form: CreateCourseModel) => {
    if (form.name !== '' && form.ploGroupID !== '') {
      createCourse({
        variables: {
          programID,
          input: form
        }
      }).then((res) => res.data.createCourse).then((course) => {
        reset({name: ''});
        router.push(`/course/${course.id}`);
      });
    }
  };
  return (<div>
    <Head>
      <title>Create a course</title>
    </Head>
    <p>
      <Link href="/">Home</Link>
      &nbsp;&#12297;&nbsp;
      <Link href="/programs">Programs</Link>
      &nbsp;&#12297;&nbsp;
      <ClientOnly>
        <ProgramAnchor programID={programID} href=""/>
      </ClientOnly>
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
  </div>);
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<{programID: string}> = async (context) => {
  const { id: programID } = context.params as Params;
  return {
    props: {
      programID
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths = ProgramStaticPaths;
