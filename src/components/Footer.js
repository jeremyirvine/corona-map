import React from 'react';

import { useSiteMetadata } from 'hooks';

import Container from 'components/Container';

const Footer = () => {

  return (
    <footer>
      <Container>
        <p>
          &copy; { new Date().getFullYear() }, Jeremy Irvine
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
