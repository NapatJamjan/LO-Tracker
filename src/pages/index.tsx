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
  useEffect(() => {
    initData();
  }, [])
  return (
    <Layout>
      <Seo title="Home" />
      <h1>Welcome</h1>
      <Link to="/programs"> Go to my document </Link>
      <p className="underline">A Capstone project about tracking learning outcome of each and all students in your course.</p>
    </Layout>
  );
};

export default Home;
