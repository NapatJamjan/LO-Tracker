import Head from 'next/head';
import Link from 'next/link'
import { useRouter } from 'next/router';
import ClientOnly from '../../../../components/ClientOnly';

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
  const {id: courseID} = router.query; // extract id from router.query and rename to courseID
  return <div>
    Hello {courseID}
    <Link href={`/course/${courseID}`}>Back to Course Homepage</Link>
    <button onClick={() => router.push(`/course/${courseID}`)}>This also works</button>
  </div>;
};
