import React, { PropTypes } from 'react';
import { loadPositions, loadDocument } from '../data';


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

    if (this.state.document) {
      this.setState({ document: undefined });
    }
    else {
      loadDocument(p.segment, p.docid, undefined, undefined,
        d => {
          this.setState({ document: d })
        } , errmsg => {
          if (errmsg.includes('No document')) {
            this.setState({ document: undefined });
          }
          p.showAlert(errmsg, true);
      });
    }

    if (this.state.positionsData) {
      this.setState({ positionsData: undefined });
    }
    else {
      loadPositions(p.segment, p.field, p.term, p.encoding, p.docid,
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

  renderField(field) {
    return JSON.stringify(field.length == 1 ? field[0] : field);
  }

  renderDoc() {
    if (this.state.selected == '') {
      return <div>[ No document selected ]</div>
    }
    const document = this.state.document;

    if ( document ) {
      const fields = Object.keys(this.state.document.fields).map(k =>
        <div className="marple-doc-field" key={k}>
          <span className="marple-doc-fieldname">{`${k}: `}</span>
          <span className="marple-doc-fieldval">
            {this.renderField(this.state.document.fields[k])}
          </span>
        </div>
      );
      return <div>{fields}</div>;
    } else {
      return null;
    }
  }

  render() {
    const s = this.state;
    const p = this.props;

    const positions = s.positionsData ?
      <table className="postingitem-table">
        <thead>
          <tr>
            <td className="postingitem-col1h">position</td>
            <td className="postingitem-col2h">offsets</td>
            <td className="postingitem-col3h">payload</td>
          </tr>
        </thead>
        <tbody>{
          s.positionsData.positions.map((pos, idx) => <tr key={idx}>
            <td className="postingitem-col1">{
              pos.position == -1 ? '-' : pos.position
            }</td>
            <td className="postingitem-col2">{
              pos.startOffset == -1 ? '-' :
                `${pos.startOffset}-${pos.endOffset}`
            }</td>
            <td className="postingitem-col3">{pos.payload}</td>
          </tr>
        )}</tbody></table>
      : null;

    const doc = this.renderDoc();

    const toggle = s.positionsData ?
      'glyphicon-triangle-bottom' : 'glyphicon-triangle-right';

    return <div>
      <a href="#" onClick={ e =>
        { e.preventDefault(); this.handlePositionClick(); }}>
        {p.docid}
        <span className={'postingitem-glyph glyphicon ' + toggle}
              aria-hidden="true"></span>
      </a>
      {positions}
      { doc }
    </div>;
  }
}

PostingItem.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  field: PropTypes.string.isRequired,
  term: PropTypes.string.isRequired,
  encoding: PropTypes.string.isRequired,
  docid: PropTypes.number.isRequired,
  showAlert: PropTypes.func.isRequired
}

export default PostingItem;
