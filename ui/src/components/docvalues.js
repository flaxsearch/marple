import React from 'react';
import { Nav, NavItem, FormControl } from 'react-bootstrap';

import { loadDocValues } from '../data';
import { handleError } from '../util';


class DocValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: undefined,
      docValues: undefined
    }

    this.setDocs = this.setDocs.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.handleDocValuesError = this.handleDocValuesError.bind(this);
  }

  componentDidMount() {
    if (this.props.field) {
      loadDocValues(this.props.segment, this.props.field,
        this.state.docs, docValues => {
          this.setState({ docValues });
        }, this.handleDocValuesError
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field) {
      loadDocValues(newProps.segment, newProps.field,
        this.state.docs, docValues => {
          this.setState({ docValues });
        }, this.handleDocValuesError
      );
    }
  }

  handleDocValuesError(errmsg) {
    if (errmsg.includes('No doc values for')) {
      this.setState({ docValues: {
        type: 'NONE',
        values: null
      }})
    }
    else {
      handleError(errmsg)
    }
  }

  setDocs(docs) {
    console.log('FIXME');
  }

  render() {
    const s = this.state;

    if (s.docValues == undefined) {
      return <div/>;
    }

    if (s.docValues.type == 'NONE') {
      return <div><Nav><NavItem>[no doc values]</NavItem></Nav></div>;
    }

    let keys = Object.keys(s.docValues.values);
    if (s.docs) {
      // FIXME display doc values in order of user-entered docs
    }
    else {
      keys.sort((a, b) => {
        const ia = parseInt(a);
        const ib = parseInt(b);
        return ia < ib ? -1 : ia > ib ? 1 : 0;
      });
    }

    var dvList = keys.map(function(docid) {
      const text = formatDocValue(
        docid, s.docValues.values[docid], s.docValues.type);
      return (<NavItem key={docid}>{text}</NavItem>)
    });

    const style = {"paddingTop": "7px"};
    const placeholder = "Doc IDs (e.g. 1, 5, 10-100)";
    return <div>
      <form style={style} onSubmit={ e => e.preventDefault() }>
          <FormControl type="text" placeholder={placeholder} value={s.docs}
            onChange={ e => this.setDocs(e.target.value) } />
      </form>

      <Nav>{dvList}</Nav>
    </div>;
  }
}

const formatDocValue = (docid, docvalue, type) => {
  var dvtext;
  if (type == 'BINARY' || type == 'SORTED') {
    dvtext = docvalue; // FIXME encoding
  }
  else if (type == 'SORTED_SET') {
    dvtext = docvalue.join(', '); // FIXME encoding
  }
  else if (type == 'NUMERIC') {
    dvtext = docvalue;
  }
  else if (type == 'SORTED_NUMERIC') {
    dvtext = docvalue.join(', ');
  }
  else {
    handleError(`unknown doc values type ${type}`);
    return '';
  }

  return `${docid}: ${dvtext}`;
}


export default DocValues;
