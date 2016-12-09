import React from 'react';

import { Navbar, Nav, NavItem, NavDropdown, MenuItem, FormGroup } from 'react-bootstrap';

class MarpleNav extends React.Component {
  render() {
    const p = this.props;
    const s = this.state;

    return <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#">Marple</a>
        </Navbar.Brand>
      </Navbar.Header>
      <Navbar.Text pullRight>
        Exploring lucene index: {p.indexData.indexpath} ({p.indexData.numDocs} docs/{p.indexData.numDeletedDocs} deletions)
      </Navbar.Text>
    </Navbar>;
  }
}

export default MarpleNav;
