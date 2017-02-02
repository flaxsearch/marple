import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { loadPostings } from '../data';
import PostingItem from './postingitem';

const FETCH_COUNT = 50;


class Postings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { postings: [] };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    componentDidMount() {
        const p = this.props;
        loadPostings(p.segment, p.field, p.term, 0, FETCH_COUNT,
            data => {
	            this.setState(data);
	        },
	        errmsg => {
                if (errmsg.includes('No term')) {
                    this.setState({ postings: [] });
                }
                else {
                    this.props.showAlert(errmsg, true);
                }
	        }
        );
    }

    loadMore() {
        const p = this.props;
        const s = this.state;

        loadPostings(p.segment, p.field, p.term, s.moreFrom, FETCH_COUNT,
            data => {
                this.setState({
                    postings: this.state.postings.concat(data.postings),
                    moreFrom: data.moreFrom
                });
  	        },
  	        errmsg => {
                if (errmsg.includes('No term')) {
                    this.setState({ postings: [] });
                }
                else {
                    this.props.showAlert(errmsg, true);
                }
            }
        );
    }

    render() {
        const s = this.state;
        const p = this.props;

        if (s.postings.length == 0) {
            return <div></div>;
        }

        const moreFromLink = s.moreFrom ?
            <Button bsStyle="primary" bsSize="xsmall"
             style={{ marginTop: "3px" }}
             onClick={this.loadMore}>Load more</Button> : '';

        const postingList = s.postings.map((docid, idx) =>
            <PostingItem key={idx} segment={p.segment} field={p.field}
                term={p.term} docid={docid} showAlert={p.showAlert}/>
        );
        return <div>
            <div style={{ color: 'grey' }}>in docs:</div>
            {postingList}
            {moreFromLink}
        </div>;
    }
}

export default Postings;
