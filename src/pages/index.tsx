import React, { useEffect, useState } from 'react';
import { Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

import { Modal, ModalTitle, ModalBody, ModalFooter, Collapse } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';

import styled from 'styled-components';
import { initData } from '../shared/initialData';

const Home = () => {
  return (
    <Layout>
      <Seo title="Home" />
      <h1>Welcome</h1>
      <Link to="/programs" className="underline"><h4> Go to my document </h4></Link>
      <p>A Capstone project about tracking learning outcome of each and all students in your course.</p>
      <button onClick={() => initData()} className="text-5xl">Click me to init data</button>
    </Layout>
  );
};

export default Home;
