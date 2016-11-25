import React, { PropTypes } from 'react';

import { Navbar, Nav, NavItem } from 'react-bootstrap';

export const MarpleNav = props => {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#">Marple</a>
        </Navbar.Brand>
      </Navbar.Header>
      <Navbar.Text pullRight>
        Exploring lucene index: {props.indexData.indexpath}
      </Navbar.Text>
    </Navbar>
  );
};

export const Fields = props => {
  var fieldtabs = props.fields.map(function(f, i) {
    return (<NavItem eventKey={f.name} key={f.name}>{f.name}</NavItem>);
  });
  return (
    <Nav bsStyle="pills" stacked onSelect={props.onSelect}
       activeKey={props.selected}>{fieldtabs}</Nav>
  );
};

export const Segments = props => {
  var segmenttab = props.segments.map(function(f, i) {
    var name = "Segment " + f.ord;
    return <NavItem eventKey={i} key={i + 1}>{name}</NavItem>;
  });
  segmenttab.unshift(<NavItem eventKey={null} key={0}>All segments</NavItem>);
  return (
    <Nav bsStyle="pills" stacked onSelect={props.onSelect}
         activeKey={props.selected}>{segmenttab}</Nav>
  );
};