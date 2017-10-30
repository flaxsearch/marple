import React, { PropTypes } from 'react';
import { Nav, NavItem, FormGroup, FormControl, Radio, Form, Button, Table } from 'react-bootstrap';
import { loadTermsData, getFieldEncoding, setFieldEncoding } from '../data';
import { EncodingDropdown } from './misc';
import TermItem from './termitem'
import { isValidRegExp } from '../util';

const TERMSLISTSTYLE = {
    marginTop: '10px',
    marginLeft: '15px'
};

const LABELSTYLE = {
    width:'140px',
    color: 'gray'
};

const RALIGN = {
    textAlign: 'right'
};

const FETCH_COUNT = 50;


class Terms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            termsData: undefined,
            termsFilter: '',
            encoding: ''
        };

        this.onError = this.onError.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.setTermsFilter = this.setTermsFilter.bind(this);
        this.setEncoding = this.setEncoding.bind(this);
        this.termsTable = this.termsTable.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    onError(errmsg) {
        if (errmsg.includes('No such field')) {
            this.setState({ termsData: { terms: undefined }});
        }
        else {
            this.props.showAlert(errmsg, true);
        }
    }

    getValidationState() {
        if (!this.state.termsFilter) {
            return null;
        } else if (isValidRegExp(this.state.termsFilter)) {
            return "success";
        } else {
            return "error";
        }
    }

    loadAndDisplayData(segment, field, termsFilter, newEncoding) {
        newEncoding = newEncoding || getFieldEncoding(
                this.props.indexData.indexpath, field, 'terms');

        const onSuccess = (termsData, encoding) => {
            if (encoding != this.state.encoding) {
                setFieldEncoding(this.props.indexData.indexpath,
                    this.props.field, 'terms', encoding);
            }

            this.setState({ termsFilter, termsData, encoding });

            if (encoding != newEncoding) {
                this.props.showAlert(`${newEncoding} is not a valid encoding for this field`);
            }
        };

        if (isValidRegExp(termsFilter)) {
            loadTermsData({ segment, field, termsFilter, encoding: newEncoding,
                count: FETCH_COUNT, onSuccess, onError: this.onError });
        } else {
            this.setState({ termsFilter });
        }
    }

    componentDidMount() {
        if (this.props.field) {
            this.loadAndDisplayData(this.props.segment, this.props.field, '');
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.field) {
            this.loadAndDisplayData(newProps.segment, newProps.field, this.state.termsFilter);
        }
    }

    setTermsFilter(termsFilter) {
        this.loadAndDisplayData(this.props.segment, this.props.field, termsFilter, this.state.encoding);
    }

    setEncoding(encoding) {
        this.loadAndDisplayData(this.props.segment, this.props.field, this.state.termsFilter, encoding);
    }

    termsTable() {
        const s = this.state;
        const p = this.props;
        const termEntries = s.termsData.terms.map((term, idx) => (
            <tr key={idx}>
                <td>
                    <TermItem key={idx}
                     segment={p.segment} field={p.field}
                     term={term.term} encoding={s.encoding}
                     showAlert={p.showAlert} />
                </td>
                <td style={RALIGN}>{term.docFreq}</td>
                <td style={RALIGN}>{term.totalTermFreq == -1 ? "-" : term.totalTermFreq}</td>
            </tr>
        ));

        return(
            <Table>
                <thead>
                <tr>
                    <td style={{ width:'80%' }}>term</td>
                    <td style={RALIGN}>docFreq</td>
                    <td style={RALIGN}>totalTermFreq</td>
                </tr>
                </thead>
                <tbody>
                {termEntries}
                </tbody>
            </Table>
        );
    }

    loadMore() {
        const onSuccess = newTermsData => {
            const termsData = {
                termCount: newTermsData.termCount,
                docCount: newTermsData.docCount,
                minTerm: newTermsData.minTerm,
                maxTerm: newTermsData.maxTerm,
                terms: this.state.termsData.terms.concat(newTermsData.terms),
                moreFrom: newTermsData.moreFrom
            };
            this.setState({ termsData });
        };

        loadTermsData({
            segment: this.props.segment,
            field: this.props.field,
            termsFilter: this.state.termsFilter,
            encoding: this.state.encoding,
            from: this.state.termsData.moreFrom,
            count: FETCH_COUNT,
            onSuccess,
            onError: this.onError
        });
    }

    render() {
        const s = this.state;
        if (s.termsData == undefined) {
            return <div/>;
        }

        if (s.termsData.terms == undefined) {
            return <div style={{margin:'14px'}}>
                [no terms for field { this.props.field }]
            </div>;
        }

        const termsList = this.termsTable();
        const termCount = s.termsData.termCount == -1 ? "not stored" : s.termsData.termCount;

        const moreFromLink = s.termsData.moreFrom ?
            <Button bsStyle="primary" onClick={this.loadMore}>Load more</Button> : '';

        return <div>
            <table style={{width:'100%', border:'0px', margin:'7px 0px 7px 14px'}}>
                <tbody>
                <tr>
                    <td style={LABELSTYLE}>Total terms:</td>
                    <td style={{width:'auto'}}>{termCount}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Docs with terms:</td>
                    <td style={{width:'auto'}}>{s.termsData.docCount}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Min term:</td>
                    <td style={{width:'auto'}}>{s.termsData.minTerm}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Max term:</td>
                    <td style={{width:'auto'}}>{s.termsData.maxTerm}</td>
                </tr>
                </tbody>
            </table>
            <Form inline onSubmit={ e => e.preventDefault() }>
                <FormGroup  validationState={ this.getValidationState() }>
                    <FormControl type="text" value={s.termsFilter}
                                 placeholder={'Filter by regexp'}
                                 onChange={ e => this.setTermsFilter(e.target.value) }
                                 style={{width:'90%'}} />
                </FormGroup>
                <EncodingDropdown encoding={s.encoding} numeric={true}
                                  onSelect={x => this.setEncoding(x)} />
            </Form>

            <div style={TERMSLISTSTYLE}>
                {termsList}
                {moreFromLink}
            </div>
        </div>;
    }
}

Terms.propTypes = {
    segment: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number
    ]),
    field: PropTypes.string.isRequired,
    indexData: PropTypes.object.isRequired,
    showAlert: PropTypes.func.isRequired
};

export default Terms;
