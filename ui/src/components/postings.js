import React, { PropTypes } from 'react';
import { loadPostings } from '../data';


class Postings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postingsData: undefined,
      displayPostings: false
    }

    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps(newprops) {
    const p = this.props;

    if (newprops.displayPostings) {
      this.loadAndDisplayData(p.segment, p.field, p.term);
    }
    this.setState({ displayPostings: newprops.displayPostings });
  }

  loadAndDisplayData(segment, field, term) {
    if (this.state.postingsData == undefined) {
      loadPostings(segment, field, term, postingsData => {
	    this.setState({ postingsData });
	  },
	  errmsg => {
        if (errmsg.includes('No term')) {
          this.setState({ postingsData: undefined });
        }
        else {
          this.props.showAlert(errmsg, true);
        }
	  });
    }
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (s.postingsData == undefined || !s.displayPostings) {
      return <div></div>;
    }

    var postingList = s.postingsData.postings.map((docid, idx) => <li style={{ display: 'inline-block', width: '60px' }} key={idx}>{docid}</li>);
    return <ul style={{ listStyleType: 'none' }}>{postingList}</ul>
  }

}

export default Postings;
