import React from 'react';
import { Nav, NavItem, Form, FormControl, Label } from 'react-bootstrap';
import { loadDocValues, getFieldEncoding, setFieldEncoding } from '../data';
import { handleError, parseDoclist } from '../util';
import { EncodingDropdown } from './misc';


class DocValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: '',
      docValues: undefined,
      encoding: 'utf8'
    }

    this.setDocs = this.setDocs.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.handleDocValuesError = this.handleDocValuesError.bind(this);
  }

  componentDidMount() {
    if (this.props.field) {
      const encoding = getFieldEncoding(this.props.indexData.indexpath,
                                        this.props.field, 'docvalues');
      loadDocValues(this.props.segment, this.props.field,
        this.state.docs, encoding, docValues => {
          this.setState({ docValues, encoding });
        }, this.handleDocValuesError
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field) {
      const encoding = getFieldEncoding(this.props.indexData.indexpath,
                                        newProps.field, 'docvalues');
      loadDocValues(newProps.segment, newProps.field,
        this.state.docs, encoding, docValues => {
          this.setState({ docValues, encoding });
        }, this.handleDocValuesError
      );
    }
  }

  setEncoding(enc) {
    loadDocValues(this.props.segment, this.props.field,
      this.state.docs, enc, (docValues, encoding) => {
        if (encoding == enc) {
          setFieldEncoding(this.props.indexData.indexpath,
                           this.props.field, 'docvalues', encoding);
        }
        else {
          console.log('FIXME flash up encoding warning');
        }
        this.setState({ docValues, encoding });
      }, this.handleDocValuesError
    );
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
    docs = docs.replace(/[^\d ,\-]/, '');  // restrict input
    loadDocValues(this.props.segment, this.props.field,
      docs, this.state.encoding, docValues => {
        this.setState({ docs, docValues });
      }, this.handleDocValuesError
    );
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (s.docValues == undefined) {
      return <div/>;
    }

    if (s.docValues.type == 'NONE') {
      return <div><Nav><NavItem>[no doc values]</NavItem></Nav></div>;
    }

    let keys;
    if (s.docs) {
        keys = parseDoclist(s.docs, p.indexData.numDocs);
    }
    else {
      keys = Object.keys(s.docValues.values);
      keys.sort((a, b) => {
        const ia = parseInt(a);
        const ib = parseInt(b);
        return ia < ib ? -1 : ia > ib ? 1 : 0;
      });
    }

    var dvList = keys.map(function(docid) {
      const text = formatDocValue(
        docid, s.docValues.values[docid], s.docValues.type);
      return <NavItem key={docid}>{text}</NavItem>;
    });

    const encodingDropdown = doesEncodingApply(s.docValues.type) ?
      <EncodingDropdown encoding={s.encoding} numeric={false}
                        onSelect={x => this.setEncoding(x)} /> : '';

    const style = {"paddingTop": "7px"};
    const placeholder = "Doc IDs (e.g. 1, 5, 10-100)";
    return <div>
      <Form inline style={style} onSubmit={ e => e.preventDefault() }>
        <FormControl type="text" placeholder={placeholder} value={s.docs}
          onChange={ e => this.setDocs(e.target.value) }
          style={{"width": "440px"}} />
        {" "}
        { encodingDropdown }
        {" "}
        <Label>{ s.docValues.type}</Label>
      </Form>
      <Nav>{dvList}</Nav>
    </div>;
  }
}

function formatDocValue(docid, docvalue, type) {
  var dvtext;
  if (docvalue == undefined) {
    return `(${docid}) [no value]`;
  }

  if (type == 'BINARY' || type == 'SORTED') {
    dvtext = docvalue;
  }
  else if (type == 'SORTED_SET') {
    dvtext = docvalue.join(', ');
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

  return `(${docid}) ${dvtext}`;
}

function doesEncodingApply(type) {
  return ! type.includes('NUMERIC');
}


export default DocValues;
