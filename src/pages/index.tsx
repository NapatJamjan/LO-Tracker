import React, { useState } from 'react';
import { Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

import { Modal, ModalTitle, ModalBody, ModalFooter, Collapse } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';

const Home = () => {
  const [num, setNum] = useState<number>(0);
  const [show, setShow] = useState<boolean>(false);
  let courseList: { name: string; id: string }[] = [
    { name: 'Test1', id: '5555' },
    { name: 'Test2', id: '5556' }
  ];

  return (
    <Layout>
      <Seo title="Home" />
      <h1>Hi people</h1>
      <Link to="/programs"> Go to my document </Link>
    </Layout>
  );
};

export default Home;
