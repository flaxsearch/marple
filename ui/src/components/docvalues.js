import React, { PropTypes } from 'react';
import { Form, FormControl, Label, FormGroup, Radio, Table } from 'react-bootstrap';
import { loadDocValuesByDoc, loadDocValuesByValue,
         getFieldEncoding, setFieldEncoding } from '../data';
import { parseDoclist } from '../util';
import { EncodingDropdown } from './misc';

const DocValuesByDocs = props => {
  let keys;
  if (props.docs) {
      keys = parseDoclist(props.docs, props.numDocs);
  }
  else {
    keys = Object.keys(props.docValues.values);
    keys.sort((a, b) => {
      const ia = parseInt(a);
      const ib = parseInt(b);
      return ia < ib ? -1 : ia > ib ? 1 : 0;
    });
  }

  const type = props.docValues.type;
  const values = props.docValues.values;
  let dvlist = [];
  if (type == 'BINARY' || type == 'NUMERIC') {
    keys.forEach(docid => {
      dvlist.push(<tr key={docid} className='marple-dv-item'>
        <td>{docid}</td>
        <td>-</td>
        <td>{values[docid]}</td>
      </tr>);
    });
  }
  else if (type == 'SORTED') {
    keys.forEach(docid => {
      dvlist.push(<tr key={docid} className='marple-dv-item'>
        <td>{docid}</td>
        <td>{values[docid].ord}</td>
        <td>{values[docid].value}</td>
      </tr>);
    });
  }
  else if (type == 'SORTED_NUMERIC') {
    keys.forEach(docid => {
      values[docid].forEach((value, idx) => {
        const style = (idx == values[docid].length - 1) ?
          { borderBottom: "2px solid #ddd" } : {};

        dvlist.push(<tr key={`${docid}.${idx}`} className='marple-dv-item'>
          <td style={style}>{idx == 0 ? docid : ''}</td>
          <td style={style}>-</td>
          <td style={style}>{value}</td>
        </tr>);
      });
    });
  }
  else if (type == 'SORTED_SET') {
    keys.forEach(docid => {
      values[docid].forEach((value, idx) => {
        const style = (idx == values[docid].length - 1) ?
          { borderBottom: "2px solid #ddd" } : {};

        dvlist.push(<tr key={`${docid}.${idx}`} className='marple-dv-item'>
          <td style={style}>{idx == 0 ? docid : ''}</td>
          <td style={style}>{value.ord}</td>
          <td style={style}>{value.value}</td>
        </tr>);
      });
    });
  }

  return <Table style={{marginTop:'10px'}}>
    <thead>
      <tr>
        <th style={{width:'70px'}}>Doc ID</th>
        <th style={{width:'50px'}}>Ord</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {dvlist}
    </tbody>
  </Table>
};

DocValuesByDocs.propTypes = {
  docs: PropTypes.string,
  docValues: PropTypes.object,
  numDocs: PropTypes.number
};


const DocValuesByValue = props => {
  const dvlist = props.docValues.values.map(value =>
    <tr key={value.ord} className='marple-dv-item'>
      <td>{value.ord}</td>
      <td>{value.value}</td>
    </tr>
  );
  return <Table style={{marginTop:'10px'}}>
    <thead>
      <tr>
        <th style={{width:'50px'}}>Ord</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {dvlist}
    </tbody>
  </Table>
};

DocValuesByValue.propTypes = {
  filter: PropTypes.string,
  docValues: PropTypes.object
};


class DocValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: '',
      filter: '',
      docValues: undefined,
      encoding: '',
      viewBy: 'docs'
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.setDocs = this.setDocs.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
    this.setViewBy = this.setViewBy.bind(this);
  }

  loadAndDisplayDataByDocs(segment, field, docs, newEncoding) {
    newEncoding = newEncoding || getFieldEncoding(
      this.props.indexData.indexpath, field, 'docvalues');

    loadDocValuesByDoc(segment, field, docs, newEncoding,
      (docValues, encoding) => {
        if (encoding != this.state.encoding) {
          setFieldEncoding(this.props.indexData.indexpath,
            this.props.field, 'docvalues', encoding);
        }

        this.setState({ docs, docValues, encoding, viewBy:'docs' });
        if (encoding != newEncoding) {
          this.props.showAlert(`${newEncoding} is not a valid encoding for this field`);
        }
      },
      errmsg => {
        if (errmsg.includes('No doc values for')) {
          this.setState({ docValues: { type: 'NONE', values: null }});
        }
        else {
          this.props.showAlert(errmsg, true);
        }
      }
    );
  }

  loadAndDisplayDataByValues(segment, field, filter, newEncoding) {
    newEncoding = newEncoding || getFieldEncoding(
      this.props.indexData.indexpath, field, 'docvalues');

    loadDocValuesByValue(segment, field, filter, newEncoding,
      (docValues, encoding) => {
        if (encoding != this.state.encoding) {
          setFieldEncoding(this.props.indexData.indexpath,
            this.props.field, 'docvalues', encoding);
        }

        this.setState({ docValues, encoding, filter, viewBy:'values' });
        if (encoding != newEncoding) {
          this.props.showAlert(`${newEncoding} is not a valid encoding for this field`);
        }
      },
      errmsg => {
        if (errmsg.includes('No doc values for')) {
          this.setState({ docValues: { type: 'NONE', values: null }});
        }
        else {
          this.props.showAlert(errmsg, true);
        }
      }
    );

  }

  // always open in viewBy:docs state
  componentDidMount() {
    if (this.props.field) {
      this.loadAndDisplayDataByDocs(this.props.segment, this.props.field, '');
    }
  }

  // always switch to viewBy:docs state
  componentWillReceiveProps(newProps) {
    this.setState({ docValues: undefined, viewBy: 'docs' });
    if (newProps.field) {
      this.loadAndDisplayDataByDocs(newProps.segment, newProps.field, this.state.docs);
    }
  }

  setEncoding(encoding) {
    if (this.state.viewBy == 'values' &&
        typeHasValueView(this.props.docValuesType)) {
      this.loadAndDisplayDataByValues(this.props.segment, this.props.field,
                                      this.state.filter, encoding);
    }
    else {
      this.loadAndDisplayDataByDocs(this.props.segment, this.props.field,
                                    this.state.docs, encoding);
    }
  }

  setDocs(docs) {
    docs = docs.replace(/[^\d ,\-]/, '');  // restrict input
    this.loadAndDisplayDataByDocs(this.props.segment, this.props.field,
                                  docs, this.state.encoding);
  }

  setFilter(filter) {
    this.loadAndDisplayDataByValues(this.props.segment, this.props.field,
                                    filter, this.state.encoding);
  }

  setViewBy(evt) {
    const viewBy = evt.target.value;
    if (viewBy == 'values' && typeHasValueView(this.props.docValuesType)) {
      this.loadAndDisplayDataByValues(this.props.segment, this.props.field,
                                      this.state.filter, this.state.encoding);
    }
    else {
      this.loadAndDisplayDataByDocs(this.props.segment, this.props.field,
                                    this.state.docs, this.state.encoding);
    }
  }

  render() {
    const s = this.state;
    const p = this.props;

    const encodingDropdown = doesEncodingApply(p.docValuesType) ?
      <EncodingDropdown encoding={s.encoding} numeric={true}
                        onSelect={x => this.setEncoding(x)} /> : '';

    const disableViewBy = ! typeHasValueView(p.docValuesType);

    let dvTable = '';
    let filterComp = <FormControl type="text" value={s.docs}
                  placeholder={'Filter by doc ID, e.g. 1, 3, 5-17'}
                  onChange={e => this.setDocs(e.target.value)}
                  style={{width: "100%"}}
                  className="marple-docs-input"/>;

    if (s.docValues != undefined) {
      if (p.docValuesType == 'NONE') {
        dvTable = <h3>[no doc values for field {p.field}]</h3>;
      }
      else if (s.viewBy == 'docs' || disableViewBy) {
        dvTable = <DocValuesByDocs docs={s.docs} docValues={s.docValues}
                   numDocs={p.indexData.numDocs} setDocs={this.setDocs} />
      }
      else {
        dvTable = <DocValuesByValue filter={s.filter} docValues={s.docValues}/> ;
        filterComp = <FormControl type="text" value={s.filter}
                      placeholder={'Filter by regexp'}
                      onChange={e => this.setFilter(e.target.value)}
                      style={{width: "100%"}}
                      className="marple-filter-input"/>;
      }
    }

    const viewBySelector = disableViewBy ? '' :
      <span>
        <Radio inline style={{ marginLeft: '20px' }}
               checked={ s.viewBy == 'docs' }
               value={'docs'}
               onChange={this.setViewBy}
               className="marple-radio">
          View by doc
        </Radio>
        {' '}
        <Radio inline
               checked={ s.viewBy == 'values' }
               value={'values'}
               onChange={this.setViewBy}
               className="marple-radio">
          View by value
        </Radio>
      </span>;

    return <div>
      <div style={{ marginTop: '10px' }}>
        <FormGroup>
          <Label style={{ marginRight: '15px' }}>{ p.docValuesType}</Label>
          { encodingDropdown }
          { viewBySelector }
        </FormGroup>
      </div>
      {filterComp}
      {dvTable}
    </div>;
  }
}

function doesEncodingApply(type) {
  return ! type.includes('NUMERIC');
}

function typeHasValueView(type) {
  return type == 'SORTED' || type == 'SORTED_SET';
}

DocValues.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  field: PropTypes.string.isRequired,
  docValuesType: PropTypes.string.isRequired,
  indexData: PropTypes.object.isRequired,
  showAlert: PropTypes.func.isRequired
};


export default DocValues;
