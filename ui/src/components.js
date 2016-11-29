import React, { PropTypes } from 'react';

import { Navbar, Nav, NavItem, FormGroup, FormControl } from 'react-bootstrap';

export const MarpleNav = props => {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#">Marple</a>
        </Navbar.Brand>
      </Navbar.Header>
      <Navbar.Text pullRight>
        Exploring lucene index: {props.indexData.indexpath} ({props.indexData.numDocs} docs/{props.indexData.numDeletedDocs} deletions)
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
       activeKey={props.selected}>
       {fieldtabs}
    </Nav>
  );
};

export const Segments = props => {
  var segmenttab = props.segments.map(function(f, i) {
    var name = "Segment " + f.ord;
    var stats = "(" + f.numDocs + " docs/" + (f.maxDoc - f.numDocs) + " dels)";
    return <NavItem eventKey={i} key={i + 1}>{name}<br/>{stats}</NavItem>;
  });
  segmenttab.unshift(<NavItem eventKey={null} key={0}>All segments</NavItem>);
  return (
    <Nav bsStyle="pills" stacked onSelect={props.onSelect}
         activeKey={props.selected}>{segmenttab}</Nav>
  );
};

export const TermsData = props => {
  var termsList = props.terms.map(function(term) {
    return (<NavItem key={term}>{term}</NavItem>)
  });
  const style = {"paddingTop": "7px"};
  return (
    <div>
      <form style={style} onSubmit={ e => e.preventDefault() }>
          <FormControl type="text" placeholder="Filter" value={props.termsFilter}
            onChange={ e => props.setTermsFilter(e.target.value) } />
      </form>

      <Nav>{termsList}</Nav>
    </div>
  );
};

export const FieldData = props => {
  if (props.field == undefined) {
      return (<div/>)
  }
  return (
    <div>
      <Nav bsStyle="tabs" justified activeKey="terms">
        <NavItem eventKey="terms">Terms</NavItem>
        <NavItem eventKey="docvalues">DocValues</NavItem>
        <NavItem eventKey="points">Points</NavItem>
      </Nav>
      <TermsData terms={props.termsData} termsFilter={props.termsFilter}
        setTermsFilter={props.setTermsFilter}/>
    </div>
  );
};
