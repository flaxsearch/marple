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
  }

  componentDidMount() {
    if (this.props.field) {
      loadDocValues(this.props.segment, this.props.field,
        this.state.docs, docValues => {
          this.setState({ docValues });
        }, errorMsg => handleError(errorMsg)
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field) {
      loadDocValues(newProps.segment, newProps.field,
        this.state.docs, docValues => {
          this.setState({ docValues });
        }, errorMsg => handleError(errorMsg)
      );
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
  // FIXME
  const dvtext = JSON.stringify(docvalue);
  return `${docid}: ${dvtext}`;
}


export default DocValues;
