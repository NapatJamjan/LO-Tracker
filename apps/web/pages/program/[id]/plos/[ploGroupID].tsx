import { gql } from '@apollo/client'
import { ProgramMainMenu, ProgramSubMenu } from '../../../../components/Menu'
import { GetServerSideProps, GetStaticProps } from 'next'
import Head from 'next/head'
import { ParsedUrlQuery } from 'querystring'
import { initializeApollo, addApolloState } from '../../../../utils/apollo-client'

export default function Page({programID, ploGroupDashboard}: {programID: string, ploGroupDashboard: DashboardPLOGroup}) {
  return <div>
    <Head>
      <title>PLO Group Dashboard</title>
    </Head>
    <ProgramMainMenu programID={programID} />
    <ProgramSubMenu programID={programID} selected={'plos'}/>
    <div>
      {JSON.stringify(ploGroupDashboard)}
    </div>
  </div>
}

interface PageParams extends ParsedUrlQuery {
  id: string
  ploGroupID: string
}

export const getServerSideProps: GetServerSideProps<{programID: string, ploGroupDashboard: DashboardPLOGroup}> = async (context) => {
  const { id: programID, ploGroupID } = context.params as PageParams
  const client = initializeApollo()
  const { data } = await client.query<{individualPLOGroupSummary: DashboardPLOGroup}, {ploGroupID: string}>({
    query: gql`
      query individualPLOGroupSummary($ploGroupID: ID!) {
        individualPLOGroupSummary(ploGroupID: $ploGroupID) {
          name
          plos {
            title
            description
            stats {
              min
              max
              mean
              median
            }
          }
          students {
            id
            email
            name
            surname
          }
    }}`, 
    variables: { ploGroupID }
  })
  return addApolloState(client, {
    props: {
      programID,
      ploGroupDashboard: data.individualPLOGroupSummary,
    },
    //revalidate: 30,
  })
}

interface DashboardPLOGroup {
  name: string
  plos: {
    title: string
    description: string
    stats: {
      min: number
      max: number
      mean: number
      median: number
    }
  }[]
  students: {
    id: string
    email: string
    name: string
    surname: string
  }[]
}
