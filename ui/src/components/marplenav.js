import React from 'react';

import { Navbar, Nav, NavItem, NavDropdown, MenuItem, FormGroup } from 'react-bootstrap';

const MarpleNav = props => {
  return <Navbar>
    <Navbar.Header>
      <Navbar.Brand>
        <a href="#">Marple</a>
      </Navbar.Brand>
    </Navbar.Header>
    <Navbar.Text pullRight>
      Exploring lucene index: {props.indexData.indexpath} ({props.indexData.numDocs} docs/{props.indexData.numDeletedDocs} deletions)
    </Navbar.Text>
  </Navbar>;
};

export default MarpleNav;
