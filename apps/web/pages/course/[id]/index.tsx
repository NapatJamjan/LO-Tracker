import Head from 'next/head'
import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { CourseStaticPaths } from '../../../utils/staticpaths'
import { CourseSubMenu, KnownCourseMainMenu } from '../../../components/Menu'
import { initializeApollo, addApolloState } from '../../../utils/apollo-client'

interface CourseModel {
  id: string
  name: string
  description: string
  semester: number
  year: number
  ploGroupID: string
  programID: string
}

export default ({course}: {course: CourseModel}) => {
  return <div>
    <Head>
      <title>Course Home</title>
    </Head>
    <KnownCourseMainMenu programID={course.programID} courseID={course.id} courseName={course.name}/>
    <CourseSubMenu courseID={course.id} selected={'main'}/>
    <p className="mt-5">
      <span className="text-2xl">Course Description</span><br/>
      <span>{course.description}</span>
    </p>
  </div>
}

interface Params extends ParsedUrlQuery {
  id: string
}

export const getStaticProps: GetStaticProps<{course: CourseModel}> = async (context) => {
  const { id: courseID } = context.params as Params
  const GET_COURSE = gql`
    query CourseDescription($courseID: ID!) {
      course(courseID: $courseID) {
        id
        name
        description
        programID
  }}`
  const client = initializeApollo()
  const { data } = await client.query<{course: CourseModel}, {courseID: string}>({
    query: GET_COURSE,
    variables: {
      courseID
    }
  })
  return addApolloState(client, {
    props: {
      course: data.course
    },
    revalidate: false,
  })
}

export const getStaticPaths: GetStaticPaths = CourseStaticPaths
