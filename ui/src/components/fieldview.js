import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import Terms from './terms';
import DocValues from './docvalues';
import { handleError } from '../util';


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

  render() {
    const s = this.state;
    if (this.props.field == undefined) {
      return <div/>;
    }
    else {
      const panel = s.activePanel == "terms" ?
        <Terms segment={this.props.segment} field={this.props.field} />
        : s.activePanel == "docvalues" ?
        <DocValues segment={this.props.segment} field={this.props.field} />
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

export default FieldView;
