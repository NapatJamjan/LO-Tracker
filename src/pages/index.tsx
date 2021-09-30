import React, { useState } from 'react';
import { Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

import { Modal, ModalTitle, ModalBody, ModalFooter, Collapse } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';

import styled from 'styled-components';

const Home = () => {
  return (
    <Layout>
      <Seo title="Home" />
      <h1>Hi people</h1>
      <Link to="/programs"> Go to my document </Link>
    </Layout>
  );
};

export default Home;
