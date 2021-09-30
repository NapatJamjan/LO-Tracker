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
  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    api
      .get<CourseResponse[]>('/courses', { params: { programID } })
      .then((res) => res.data)
      .then(setCourses);
  }, []);
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
      {courses.map((course) => (
        <div key={course.courseID} className="rounded shadow-lg p-3">
          <Link to={`./${course.courseID}`}>
            {course.courseName} - {course.semester == 3 ? 'S' : course.semester}/{course.year}
          </Link>
        </div>
      ))}
      <div className="py-3"></div>
      <CreateCourseForm programID={programID} />
    </Layout>
  );
};

const CreateCourseForm: React.FC<{ programID: string }> = ({ programID }) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, handleSubmit, setValue } = useForm<{
    name: string;
    semester: number;
    year: number;
  }>();
  return (
    <div>
      <button onClick={() => setShow(true)}>Create a new course.</button>
      <Modal show={show} onHide={() => setShow(false)}>
        <form
          onSubmit={handleSubmit((form) => {
            if (form.name != '') {
              const api = axios.create({
                baseURL: 'http://localhost:5000/api'
              });
              api.post('/course', { ...form, programID }).then(() => {
                setValue('name', '');
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
            <input {...register('name')} />
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
