import Link from 'next/link';
import router from 'next/router';
import { CourseNameLink, ProgramNameLink } from './ConvertIDName';

function MainMenuWithOnlyProgram({programID}: {programID: string}) {
  return <>
    <Link href="/">Home</Link>
    {' '}&#12297;{' '}
    <Link href="/programs">Programs</Link>
    {' '}&#12297;{' '}
    <ProgramNameLink programID={programID} href={`/program/${programID}/courses`}/>
  </>;
}

export function KnownProgramMainMenu({programID, programName}: {programID: string, programName: string}) {
  return <>
    <Link href="/">Home</Link>
    {' '}&#12297;{' '}
    <Link href="/programs">Programs</Link>
    {' '}&#12297;{' '}
    <Link href={`/program/${programID}/courses`}>{programName}</Link>
  </>;
}

export function ProgramMainMenu({programID}: {programID: string}) {
  return <p>
    <MainMenuWithOnlyProgram programID={programID}/>
  </p>;
}

export function ProgramSubMenu({programID, selected}: {programID: string, selected: 'courses' | 'plos' | 'dashboards' | 'settings'}) {
  const buttonStyle = "cursor-pointer inline-block py-1 px-2 rounded-md border-1 border-transparent hover:border-black";
  const highlight = (highlightTarget: 'courses' | 'plos' | 'dashboards' | 'settings') => selected === highlightTarget?'text-white bg-black':'';
  const linkTo = (target: 'courses' | 'plos' | 'dashboards' | 'settings') => selected !== target?router.push(`/program/${programID}/${target}`):null;
  return <p className="my-3 flex gap-x-3">
    <span className={`${buttonStyle} ${highlight('courses')}`} onClick={() => linkTo('courses')}>Courses</span>
    <span className={`${buttonStyle} ${highlight('plos')}`} onClick={() => linkTo('plos')}>PLOs</span>
    <span className={`${buttonStyle} ${highlight('dashboards')}`} onClick={() => linkTo('dashboards')}>Dashboards</span>
    <span className={`${buttonStyle} ${highlight('settings')}`} onClick={() => linkTo('settings')}>Settings</span>
  </p>;
}

export function CourseMainMenu({programID, courseID}: {programID: string, courseID: string}) {
  return <p>
    <MainMenuWithOnlyProgram programID={programID}/>
    {' '}&#12297;{' '}
    <CourseNameLink courseID={courseID} href={`/course/${courseID}`}/>
  </p>;
}

export function KnownCourseMainMenu({programID, courseID, courseName}: {programID: string, courseID: string, courseName: string}) {
  return <p>
    <MainMenuWithOnlyProgram programID={programID}/>
    {' '}&#12297;{' '}
    <Link href={`/course/${courseID}`}>{courseName}</Link>
  </p>;
}

export function CourseSubMenu({courseID, selected}: {courseID: string, selected: 'main' | 'los' | 'quizzes' | 'students' | 'dashboards' | 'settings'}) {
  const buttonStyle = "cursor-pointer inline-block py-1 px-2 rounded-md border-1 border-transparent hover:border-black";
  const highlight = (highlightTarget: 'main' | 'los' | 'quizzes' | 'students' | 'dashboards' | 'settings') => selected === highlightTarget?'text-white bg-black':'';
  const linkTo = (target: 'los' | 'quizzes' | 'students' | 'dashboards' | 'settings') => selected !== target?router.push(`/course/${courseID}/${target}`):null;
  return <p className="my-3 flex gap-x-3">
    <span className={`${buttonStyle} ${highlight('main')}`} onClick={() => selected !== 'main'?router.push(`/course/${courseID}`):null}>Courses</span>
    <span className={`${buttonStyle} ${highlight('los')}`} onClick={() => linkTo('los')}>LOs</span>
    <span className={`${buttonStyle} ${highlight('quizzes')}`} onClick={() => linkTo('quizzes')}>Quizzes</span>
    <span className={`${buttonStyle} ${highlight('students')}`} onClick={() => linkTo('students')}>Students</span>
    <span className={`${buttonStyle} ${highlight('dashboards')}`} onClick={() => linkTo('dashboards')}>Dashboards</span>
    <span className={`${buttonStyle} ${highlight('settings')}`} onClick={() => linkTo('settings')}>Settings</span>
  </p>;
}
