import Link from 'next/link';
import { gql, useQuery } from "@apollo/client";

interface ProgramModel {
  id: string;
  name: string;
  description: string;
};

export default function ProgramNameLink({programID, href}: {programID: string, href: string}) {
  const {data, loading, error} = useQuery<{program: ProgramModel}, {programID: string}>(gql`
    query ProgramName($programID: ID!) {
      program(programID: $programID) {
        name
      }
    }
  `, {variables: {programID}});
  return (<Link href={href}><span style={{pointerEvents: (href === '' || href === '.')?'none':'auto'}}>
    {loading || error && <>{programID}</>}
    {data && <>{data.program.name}</>}
  </span></Link>);
};