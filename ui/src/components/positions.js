import React, { PropTypes } from 'react';
import { loadPositions } from '../data';

class Positions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positionsData: undefined,
      displayPositions: false
    }

    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  loadAndDisplayData(segment, field, term, docid) {
    if (this.state.positionsData === undefined) {
      loadPositions(segment, field, term, docid, positionsData => this.setState({ positionsData }),
	  errmsg => {
        if (errmsg.includes('No document')) {
          this.setState({ positionsData: undefined });
        }
        else {
          this.props.showAlert(errmsg, true);
        }
	  });
    }
  }

  componentWillReceiveProps(newprops) {
    const p = this.props;

    if (newprops.field !== p.field || newprops.term !== p.term || newprops.segment !== p.segment) {
      // New field and/or term - clear the postings data
      this.setState({ positionsData: undefined, displayPositions: false });
    } else {
      if (newprops.displayPositions) {
        this.loadAndDisplayData(p.segment, p.field, p.term, p.docid);
      }
      this.setState({ displayPositions: newprops.displayPositions });
    }
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (s.positionsData == undefined || !s.displayPositions) {
      return <div></div>;
    }

	return this.buildPositionsTable(s.positionsData.positions);
  }

  buildPositionsTable(positions) {
    var positionsRows = positions.map((pos, idx) =>
      <tr key={idx}>
        <td>{pos.position}</td>
        <td>{pos.startOffset}</td>
        <td>{pos.endOffset}</td>
        <td>{pos.payload}</td>
      </tr>
    );

    return <table><thead><tr><td>Position</td><td>Start</td><td>End</td><td>Payload</td></tr></thead>
      <tbody>{positionsRows}</tbody>
      </table>;
  }
}

export default Positions;
