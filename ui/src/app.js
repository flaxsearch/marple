import React from 'react';
import ReactDOM from 'react-dom';
import { Nav, NavItem, Col, Tabs, Tab, Alert, Grid, Row } from 'react-bootstrap';

import FieldView from './components/fieldview';
import MarpleNav from './components/marplenav';
import { Fields, Segments } from './components/misc';
import { segmentFilter, loadIndexData, loadFieldsData } from './data';


class MarpleContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indexData: { indexpath: "loading", generation: -1, segments: []},
      fieldsData: []
    };

    this.selectSegment = this.selectSegment.bind(this);
    this.selectField = this.selectField.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.dismissAlert = this.dismissAlert.bind(this);
  }

  componentDidMount() {
    loadIndexData(data => {
      this.setState({ indexData: data });
    }, errorMsg => this.showAlert(errorMsg, true))
  }

  selectSegment(segNumber) {
    loadFieldsData(segNumber, fieldsData => {
      this.setState({
        fieldsData,
        selectedSegment: segNumber,
        selectedField: undefined
      });
    }, errorMsg => this.showAlert(errorMsg, true));
  }

  selectField(fieldName) {
    this.setState({
      selectedField: fieldName
    });
  }

  showAlert(message, isError) {
    this.setState({
      alertMessage: message,
      alertLevel: isError ? 'danger' : 'warning'
    })
  }

  dismissAlert() {
    this.setState({
      alertLevel: undefined
    });
  }

  render() {
    const s = this.state;
    const alert = s.alertLevel ? <Grid><Row><Alert
      bsStyle={s.alertLevel} onDismiss={this.dismissAlert}>
      <strong>{s.alertLevel == 'danger' ? 'ERROR: ' : 'Warning: '}</strong>
      {s.alertMessage}</Alert></Row></Grid> : '';

    return <div>
      <MarpleNav indexData={s.indexData}/>
      { alert }
      <Col md={2}>
        <Segments segments={s.indexData.segments}
                  onSelect={this.selectSegment}
                  selected={s.selectedSegment}/>
      </Col>
      <Col md={2}>
        <Fields fields={s.fieldsData}
                onSelect={this.selectField}
                selected={s.selectedField}/>
      </Col>
      <Col md={6}>
        <FieldView segment={s.selectedSegment}
                   field={s.selectedField}
                   indexData={s.indexData}
                   showAlert={this.showAlert}/>
      </Col>
    </div>;
  }
}

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));
