import Head from 'next/head';
import { useRouter } from 'next/router';
import ClientOnly from '../../../../components/ClientOnly';

// path => /course/[id]/dashboards/export
export default function Index() {
  return (<div>
    <Head>
      <title>Dashboard</title>
    </Head>
    <ClientOnly>
      <ExportPage/>
    </ClientOnly>
  </div>);
};

function ExportPage() {
  const router = useRouter();
  const {id: courseID} = router.query; // extract id from router.query and rename to courseID
  return <div>
    Hello {courseID}
  </div>;
};
