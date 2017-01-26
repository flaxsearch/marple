import React, { PropTypes } from 'react';
import { loadPositions } from '../data';

// FIXME - put these styles into CSS classes

const TABLESTYLE = {
  marginLeft: '15px',
  width: '100%'
};

const COL1STYLE = {
  width: '15%',
  textAlign: 'right'
};

const COL2STYLE = {
  width: '20%',
  textAlign: 'right'
};

const COL3STYLE = {
  width: 'auto',
  textAlign: 'left',
  paddingLeft: '20px'
};

const COL1HSTYLE = {
  width: '15%',
  textAlign: 'right',
  color: 'grey'
};

const COL2HSTYLE = {
  width: '20%',
  textAlign: 'right',
  color: 'grey'
};

const COL3HSTYLE = {
  width: 'auto',
  textAlign: 'left',
  paddingLeft: '20px',
  color: 'grey'
};


class PostingItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positionsData: undefined
    }

    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.handlePositionClick = this.handlePositionClick.bind(this);
  }

  componentWillReceiveProps(newprops) {
    this.setState({ displayPositions: undefined });
  }

  handlePositionClick() {
    const p = this.props;
    if (this.state.positionsData) {
      this.setState({ positionsData: undefined });
    }
    else {
      loadPositions(p.segment, p.field, p.term, p.docid,
        positionsData => this.setState({ positionsData }),
        errmsg => {
          if (errmsg.includes('No document')) {
            this.setState({ positionsData: undefined });
          }
          else {
            p.showAlert(errmsg, true);
        }
      });
    }
  }

  render() {
    const s = this.state;
    const p = this.props;

    const positions = s.positionsData ?
      <table style={TABLESTYLE}>
        <thead>
          <tr>
            <td style={COL1HSTYLE}>position</td>
            <td style={COL2HSTYLE}>offsets</td>
            <td style={COL3HSTYLE}>payload</td>
          </tr>
        </thead>
        <tbody>{
          s.positionsData.positions.map((pos, idx) => <tr key={idx}>
            <td style={COL1STYLE}>{
              pos.position == -1 ? '-' : pos.position
            }</td>
            <td style={COL2STYLE}>{
              pos.startOffset == -1 ? '-' :
                `${pos.startOffset}-${pos.endOffset}`
            }</td>
            <td style={COL3STYLE}>{pos.payload}</td>
          </tr>
        )}</tbody></table>
      : null;

    const toggle = s.positionsData ?
      'glyphicon-triangle-bottom' : 'glyphicon-triangle-right';

    return <div>
      <a href="#" onClick={ e =>
        { e.preventDefault(); this.handlePositionClick(); }}>
        {p.docid}
        <span className={'glyphicon ' + toggle}
              style={{ fontSize: '11px', paddingLeft: '5px', color: 'lightgrey' }}
              aria-hidden="true"></span>
      </a>
      {positions}
    </div>;
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
