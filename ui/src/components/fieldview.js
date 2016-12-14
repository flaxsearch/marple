import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import Terms from './terms';
import DocValues from './docvalues';


class FieldView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'terms'
    }

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(activePanel) {
    this.setState({ activePanel });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field != undefined) {
      const activePanel = newProps.field.hasTerms ? 'terms' : 'docvalues';
      this.setState({ activePanel });
    }
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (p.field == undefined) {
      return <div/>;
    }
    else {
      const panel = s.activePanel == "terms" ?
          <Terms segment={p.segment} field={p.field.name}
                 indexData={p.indexData} showAlert={p.showAlert} />
        : s.activePanel == "docvalues" ?
          <DocValues segment={p.segment} field={p.field.name}
                     indexData={p.indexData} showAlert={p.showAlert} />
        : <div>{ `no panel for ${s.activePanel}`}</div>;

      return <div>
        <Nav bsStyle="tabs" justified activeKey={s.activePanel} onSelect={this.onSelect}>
          <NavItem eventKey="terms">Terms</NavItem>
          <NavItem eventKey="docvalues">DocValues</NavItem>
          <NavItem eventKey="points">Points</NavItem>
        </Nav>
        { panel }
      </div>;
    }
  }
};

FieldView.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  field: PropTypes.object,
  indexData: PropTypes.object.isRequired,
  showAlert: PropTypes.func.isRequired
};

export default FieldView;
