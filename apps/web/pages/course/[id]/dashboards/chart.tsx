import Head from 'next/head';
import { useRouter } from 'next/router';
import ClientOnly from '../../../../components/ClientOnly';

// path => /course/[id]/dashboards/chart
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly>
      <ChartPage/>
    </ClientOnly>
  </div>);
};

function ChartPage() {
  const router = useRouter();
  const {id: courseID} = router.query; // extract id from router.query and rename to courseID
  return <div>
    Hello {courseID}
  </div>;
};
