import React, { PropTypes } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Positions from './positions';

class PostingItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPositions: false
    }

    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.handlePositionClick = this.handlePositionClick.bind(this);
  }

  componentWillReceiveProps(newprops) {
    this.setState({ displayPositions: false });
  }

  handlePositionClick() {
    var display = !this.state.displayPositions;
    this.setState({ displayPositions: display });
  }

  render() {
    const s = this.state;
    const p = this.props;

    return <div>
      <a href="#" onClick={ e => { e.preventDefault(); this.handlePositionClick(); }}>{p.docid}</a>
      <Positions segment={p.segment} field={p.field} term={p.term} docid={p.docid} displayPositions={s.displayPositions} showAlert={p.showAlert} />
      </div>
      ;
  }
}

PostingItem.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  field: PropTypes.string.isRequired,
  term: PropTypes.string.isRequired,
  docid: PropTypes.number.isRequired
}

export default PostingItem;
