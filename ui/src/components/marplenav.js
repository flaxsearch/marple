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
        <Nav>
          <NavDropdown title={`Encoding: ${p.encoding}`}
            onSelect={x => p.setEncoding(x)} id='encoding-dropdown'>
            <MenuItem eventKey={'utf8'}>utf8</MenuItem>
            <MenuItem eventKey={'base64'}>base64</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={'int'}>int</MenuItem>
            <MenuItem eventKey={'long'}>long</MenuItem>
            <MenuItem eventKey={'float'}>float</MenuItem>
            <MenuItem eventKey={'double'}>double</MenuItem>
          </NavDropdown>
        </Nav>

      </Navbar.Header>
      <Navbar.Text pullRight>
        Exploring lucene index: {p.indexData.indexpath} ({p.indexData.numDocs} docs/{p.indexData.numDeletedDocs} deletions)
      </Navbar.Text>
    </Navbar>;
  }
}

export default MarpleNav;
