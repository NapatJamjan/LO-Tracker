import Link from 'next/link';
import ClientOnly from './ClientOnly';
import { CourseNameLink, ProgramNameLink } from './ConvertIDName';

function MainMenuWithOnlyProgram({programID}: {programID: string}) {
  return <>
    <Link href="/">Home</Link>
    {' '}&#12297;{' '}
    <Link href="/programs">Programs</Link>
    {' '}&#12297;{' '}
    <ClientOnly>
      <ProgramNameLink programID={programID} href={`/program/${programID}/courses`}/>
    </ClientOnly>
  </>;
}

export function ProgramMainMenu({programID}: {programID: string}) {
  return <p>
    <MainMenuWithOnlyProgram programID={programID}/>
  </p>;
}

export function ProgramSubMenu({programID, selected}: {programID: string, selected: 'courses' | 'plos' | 'settings'}) {
  return <p className="my-3">
    {selected === 'courses'? <span className="underline">Courses</span>: <Link href={`/program/${programID}/courses`}>Courses</Link>}
    <span className="mx-3"></span>
    {selected === 'plos'? <span className="underline">PLOs</span>: <Link href={`/program/${programID}/plos`}>PLOs</Link>}
    <span className="mx-3"></span>
    {selected === 'settings'? <span className="underline">Settings</span>: <Link href={`/program/${programID}/settings`}>Settings</Link>}
  </p>;
}

export function CourseMainMenu({programID, courseID}: {programID: string, courseID: string}) {
  return <p>
    <MainMenuWithOnlyProgram programID={programID}/>
    {' '}&#12297;{' '}
    <ClientOnly>
      <CourseNameLink courseID={courseID} href={`/course/${courseID}`}/>
    </ClientOnly>
  </p>;
}

export function KnownCourseMainMenu({programID, courseID, courseName}: {programID: string, courseID: string, courseName: string}) {
  return <p>
    <MainMenuWithOnlyProgram programID={programID}/>
    {' '}&#12297;{' '}
    <Link href={`/course/${courseID}`}>{courseName}</Link>
  </p>;
}

export function CourseSubMenu({courseID, selected}: {courseID: string, selected: 'main' | 'los' | 'quizzes' | 'students' | 'dashbaords' | 'settings'}) {
  return <p className="my-3">
    {selected === 'main'? <span className="underline">Home</span>: <Link href={`/course/${courseID}`}>Home</Link>}
    <span className="mx-3"></span>
    {selected === 'los'? <span className="underline">LOs</span>: <Link href={`/course/${courseID}/los`}>LOs</Link>}
    <span className="mx-3"></span>
    {selected === 'quizzes'? <span className="underline">Quizzes</span>: <Link href={`/course/${courseID}/quizzes`}>Quizzes</Link>}
    <span className="mx-3"></span>
    {selected === 'students'? <span className="underline">Students</span>: <Link href={`/course/${courseID}/students`}>Students</Link>}
    <span className="mx-3"></span>
    {selected === 'dashbaords'? <span className="underline">Dashboards</span>: <Link href={`/course/${courseID}/dashboards`}>Dashboards</Link>}
    <span className="mx-3"></span>
    {selected === 'settings'? <span className="underline">Settings</span>: <Link href={`/course/${courseID}/settings`}>Settings</Link>}
    <span className="mx-3"></span>
  </p>;
}
