import { gql, useQuery } from '@apollo/client';
import Head from 'next/head';
import Link from 'next/link'
import { useRouter } from 'next/router';
import ClientOnly from '../../../../components/ClientOnly';
import ProgramAnchor from '../../../../components/ProgramAnchor';
import { useStudent } from '../../../../utils/dashboard-helper';

// path => /course/[id]/dashboards
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly>
      <IndexPage/>
    </ClientOnly>
  </div>);
};

function IndexPage() {
  const router = useRouter();
  const courseID = router.query.id as string; // extract id from router.query and rename to courseID
  const [students, loaded] = useStudent(courseID);
  return <div>
    <NavHistory courseID={courseID}/>
    Hello {courseID}<br/>
    <Link href={`/course/${courseID}`}>Back to Course Homepage</Link><br/>
    <button onClick={() => router.push(`/course/${courseID}`)}>This also works</button>
    {loaded && <p>{JSON.stringify(students)}</p>}
  </div>;
};

// supply
interface CourseModel {
  id: string;
  name: string;
  programID: string;
}

function NavHistory({courseID}: {courseID: string}) {
  const {data, loading} = useQuery<{course: CourseModel}, {courseID: string}>(gql`
    query Course($courseID: ID!) {
      course(courseID: $courseID) {
        id
        name
        programID
    }}
  `, {variables: {courseID}});
  if (loading) return <p></p>;
  return (<p>
    <Link href="/">Home</Link>
    {' '}&#12297;{' '}
    <Link href="/programs">Programs</Link>
    {' '}&#12297;{' '}
    <ProgramAnchor programID={data.course.programID} href={`/program/${data.course.programID}/courses`}/>
    {' '}&#12297;{' '}
    <Link href={`/course/${data.course.id}`}>{data.course.name}</Link>
    {' '}&#12297;{' '}
    <span>Dashboard</span>
  </p>);
}
