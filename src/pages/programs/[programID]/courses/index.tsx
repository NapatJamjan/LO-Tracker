import axios from 'axios';
import { Link } from 'gatsby';
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Layout from '../../../../components/layout';
import Seo from '../../../../components/seo';

interface CourseResponse {
  courseID: string;
  courseName: string;
  semester: number;
  year: number;
}

const Courses: React.FC<{ programID: string }> = ({ programID }) => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [filter, setFilter] = useState<string>('');
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<CourseResponse[]>('/courses', { params: { programID } })
      .then((res) => res.data)
      .then(setCourses);
  }, []);
  let courseGroups = new Map<string, CourseResponse[]>();
  for (let i = 0; i < courses.length; ++i) {
    if (courses[i].courseName.search(new RegExp(filter, 'i')) === -1) continue;
    courseGroups.set(`${courses[i].semester},${courses[i].year}`, [...(courseGroups.get(`${courses[i].semester},${courses[i].year}`) || []), {...courses[i]}]);
  }
  return (
    <Layout>
      <Seo title="Courses" />
      <p>
        <Link to="/">Home</Link>
        &nbsp;&#12297;&nbsp;
        <Link to="/programs">Programs</Link>
        &nbsp;&#12297;&nbsp;
        <span>{programID}</span>
      </p>
      <p className="my-3">
        <span className="underline">Courses</span>
        <span className="mx-3"></span>
        <Link to="../plo">PLOs</Link>
      </p>
      <input type="text" onChange={e => setFilter(e.target.value || '')} value={filter} placeholder="search"/>
      {
        Array.from(courseGroups).sort((group1, group2) => {
          let [sem1, year1] = group1[0].split(',').map(val => parseInt(val, 10));
          let [sem2, year2] = group2[0].split(',').map(val => parseInt(val, 10));
          if (year1 === year2) return sem2 - sem1;
          return year2 - year1;
        }).map((group, index) => {
          let [semester, year] = group[0].split(',').map(val => parseInt(val, 10));
          let courseList: CourseResponse[] = group[1];
          return (
            <div key={`group-${group[0]}`}>
              <h3 style={{textAlign:'left'}}>Semester {semester === 3 ? 'S' : semester}/{year}</h3>
              <ul className="courselist">
                {
                  courseList.sort((course1, course2) => {
                    if (course1.year !== course2.year) return course2.year - course1.year;
                    if (course1.semester !== course2.semester) return course2.semester - course1.semester;
                    return course1.courseName.localeCompare(course2.courseName);
                  }).map((course) => (
                    <div key={course.courseID} className="rounded shadow-lg p-3">
                      <Link to={`./${course.courseID}`}>
                        {course.courseName}
                      </Link>
                    </div>
                  ))
                }
              </ul>
            </div>
          );
        })
      }
      <div className="py-3"></div>
      <CreateCourseForm programID={programID} />
    </Layout>
  );
};

const CreateCourseForm: React.FC<{ programID: string }> = ({ programID }) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{
    courseName: string;
    semester: number;
    year: number;
  }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new course.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.courseName != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/course', { ...form, programID }).then(() => {
                setValue('courseName', '');
                setShow(false);
                window.location.reload();
              });
            }
          })}
        >
          <Modal.Header>
            <Modal.Title>Create a new course</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span>Course name:</span>
            <br />
            <input {...register('courseName')} />
            <br />

            <span>Semester:</span>
            <br />
            <select {...register('semester')}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>S</option>
            </select>
            <br />

            <span>Year:</span>
            <br />
            <select {...register('year')}>
              {Array.from({ length: 10 }, (_, i) => 2021 - i).map((year) => (
                <option value={year} key={`year-${year}`}>
                  {year}
                </option>
              ))}
            </select>
            <br />
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="save" />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;
