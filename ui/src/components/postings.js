import React, { PropTypes } from 'react';
import { loadPostings } from '../data';
import PostingItem from './postingitem';

class Postings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { postingsData: [] };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    const p = this.props;
    loadPostings(p.segment, p.field, p.term, postingsData => {
	    this.setState({ postingsData });
	  },
	  errmsg => {
        if (errmsg.includes('No term')) {
          this.setState({ postingsData: [] });
        }
        else {
          this.props.showAlert(errmsg, true);
        }
	  });
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (s.postingsData.length == 0) {
      return <div></div>;
    }

    var postingList = s.postingsData.map((docid, idx) =>
      <PostingItem key={idx} segment={p.segment} field={p.field}
       term={p.term} docid={docid} showAlert={p.showAlert}/>
    );
    return <div>
      <div style={{ color: 'grey' }}>in docs:</div>
      {postingList}
    </div>;
  }

}

export default Postings;
