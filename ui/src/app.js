import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav, NavItem, Col, Tabs, Tab } from 'react-bootstrap';
import { MARPLE_BASE } from 'config';

var indexData = { "index" : "/path/to/index" };
var fieldsData = [
    "field1" , "field2", "field3"
];

const MarpleNav = props => {
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

function segmentFilter(segment) {
  if (segment === null)
    return "";
  return "?segment=" + segment;
}

function handleError(error, msg) {
  alert("ERROR: " + error + ' (' + msg + ')');   // FIXME
}

function loadFieldsData(segment, renderFunc) {
  const url = MARPLE_BASE + "/api/fields" + segmentFilter(segment);
  fetch(url)
  .then(response => response.json())
  .then(data => { renderFunc(data); })
  .catch(error => { handleError(error, 'loadFieldsData'); });
}

function loadTermsData(segment, field, renderFunc) {
  fetch(MARPLE_BASE + "/api/terms/" + field + segmentFilter(segment))
  .then(response => response.json())
  .then(data => { renderFunc(data); })
  .catch(error => { handleError(error, 'loadTermsData'); });
}

const Fields = props => {
  var fieldtabs = props.fields.map(function(f, i) {
    return (<NavItem eventKey={f.name} key={f.name}>{f.name}</NavItem>);
  });
  return (
    <Nav bsStyle="pills" stacked onSelect={props.onSelect}
       activeKey={props.selected}>{fieldtabs}</Nav>
  );
};

const Segments = props => {
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

class MarpleContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      indexData: { indexpath: "loading", generation: -1, segments: []},
      fieldsData: [],
      selectedField: undefined,
      selectedSegment: undefined
    };

    this.selectSegment = this.selectSegment.bind(this);
    this.selectField = this.selectField.bind(this);
  }

  componentDidMount() {
    const url = MARPLE_BASE + "/api/index";
    fetch(url)
    .then(response => response.json())
    .then(data => {
      this.setState({ indexData: data });
    })
    .catch(error => { handleError(error, 'componentDidMount') });
  }

  selectSegment(segNumber) {
    loadFieldsData(segNumber, fieldsData => {
      this.setState({
        fieldsData,
        selectedSegment: segNumber,
        selectedField: undefined
      });
    });
  }

  selectField(fieldName) {
    loadTermsData(this.state.selectedSegment, fieldName, termsData => {
      this.setState({
        termsData,
        selectedField: fieldName
      });
    });
  }

  render() {
    return (
      <div>
        <MarpleNav indexData={this.state.indexData}/>
        <Col md={2}>
          <Segments segments={this.state.indexData.segments}
            onSelect={this.selectSegment}
            selected={this.state.selectedSegment}/>
        </Col>
        <Col md={2}>
          <Fields fields={this.state.fieldsData}
            onSelect={this.selectField}
            selected={this.state.selectedField}/>
        </Col>
        <Col md={6}>
          <FieldData field={this.state.selectedField}
           termsData={this.state.termsData}/>
        </Col>
      </div>
    );
  }
}

const TermsData = props => {
  var termsList = props.terms.map(function(term) {
    return (<NavItem key={term}>{term}</NavItem>)
  });
  return (
    <Nav>{termsList}</Nav>
  );
};

const FieldData = props => {
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
      <TermsData terms={props.termsData}/>
    </div>
  );
};

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));
