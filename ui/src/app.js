import React from 'react';
import ReactDOM from 'react-dom';
import { Nav, NavItem, Col, Tabs, Tab } from 'react-bootstrap';

import { MarpleNav, Fields, Segments } from './components';
import { segmentFilter, loadIndexData, loadFieldsData, loadTermsData } from './data';


function handleError(error, msg) {
  alert("ERROR: " + error + ' (' + msg + ')');   // FIXME
}

class MarpleContent extends React.Component {
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
    loadIndexData(data => {
      this.setState({ indexData: data });
    }, errorMsg => handleError(errorMsg))
  }

  selectSegment(segNumber) {
    loadFieldsData(segNumber, fieldsData => {
      this.setState({
        fieldsData,
        selectedSegment: segNumber,
        selectedField: undefined
      });
    }, errorMsg => handleError(errorMsg));
  }

  selectField(fieldName) {
    loadTermsData(this.state.selectedSegment, fieldName, termsData => {
      this.setState({
        termsData,
        selectedField: fieldName
      });
    }, errorMsg => handleError(errorMsg));
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
