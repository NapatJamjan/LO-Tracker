import { useEffect } from 'react'
import Head from 'next/head'
import { gql, useMutation } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { ProgramStaticPaths } from '../../../utils/staticpaths'
import { ProgramMainMenu } from '../../../components/Menu'
import { useSession } from 'next-auth/react'
import { initializeApollo, addApolloState } from '../../../utils/apollo-client'

interface PLOGroupModel {
  id: string
  name: string
}

interface CreateCourseModel {
  name: string
  description: string
  semester: number
  year: number
  ploGroupID: string
}

interface CreateCourseResponse {
  id: string
  name: string
  description: string
  semester: number
  year: number
  ploGroupID: string
}

const CREATE_COURSE = gql`
  mutation CreateCourse($programID: ID!, $teacherID: ID!, $input: CreateCourseInput!) {
    createCourse(programID: $programID, teacherID: $teacherID, input: $input) {
      id
      name
      description
      semester
      year
      ploGroupID
}}`

export default function Page({programID, ploGroups}: {programID: string, ploGroups: PLOGroupModel[]}) {
  const {data: session, status} = useSession()
  const [createCourse, { loading: submitting } ] = useMutation<{createCourse: CreateCourseResponse}, {programID: string, teacherID: string, input: CreateCourseModel}>(CREATE_COURSE)
  const { register, handleSubmit, reset, formState: {errors, touchedFields} } = useForm<CreateCourseModel>()
  const router = useRouter()
  const submitForm = (form: CreateCourseModel) => {
    if (form.name !== '' && form.ploGroupID !== '') {
      createCourse({
        variables: {
          programID,
          teacherID: String(session.id),
          input: form
        }
      }).then((res) => res.data.createCourse).then((course) => {
        reset({name: ''})
        router.push(`/course/${course.id}`)
      })
    }
  }
  useEffect(() => {
    if (status === 'loading') return
    if (session && (+session.roleLevel !== 1 && +session.roleLevel !== 3)) router.replace(`/program/${programID}/courses`)
  }, [session, status])
  return <div>
    <Head>
      <title>Create a course</title>
    </Head>
    <ProgramMainMenu programID={programID} />
    <div>
      <form onSubmit={handleSubmit((form) => submitting || status === 'loading'? null: submitForm(form))}>
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
          {[...ploGroups].sort((p1, p2) => p1.name.localeCompare(p2.name)).map((plo) => (
            <option value={plo.id} key={plo.id}>
              {plo.name}
            </option>
          ))}
        </select>
        <br />
        <input type="submit" value="create" className="py-2 px-4 bg-green-300 hover:bg-green-500 rounded-lg"/>
      </form>
    </div>
  </div>
}

interface Params extends ParsedUrlQuery {
  id: string
}

export const getStaticProps: GetStaticProps<{programID: string, ploGroups: PLOGroupModel[]}> = async (context) => {
  const GET_PLOGROUPS = gql`
    query PLOGroups($programID: ID!) {
      ploGroups(programID: $programID) {
        id
        name
  }}`
  const { id: programID } = context.params as Params
  const client = initializeApollo()
  const { data } = await client.query<{ploGroups: PLOGroupModel[]}, {programID: string}>({
    query: GET_PLOGROUPS,
    variables: { programID }
  })
  return addApolloState(client, {
    props: {
      programID,
      ploGroups: data.ploGroups
    },
    revalidate: 10,
  })
}

export const getStaticPaths: GetStaticPaths = ProgramStaticPaths
