import React, { PropTypes } from 'react';
import { loadPointsTree, loadPointsValues } from '../data';
import { Form, DropdownButton, MenuItem } from 'react-bootstrap';
import Waiting from './waiting';


const LABELSTYLE = {
    width:'140px',
    color: 'gray'
};

const TREESTYLE = {
    marginTop: '10px',
    marginLeft: '15px'
};

const TOGGLESTYLE = {
    fontSize: '11px',
    paddingRight: '5px',
    color: 'grey'
};

const NODESTYLE = {
    borderTop: "1px solid lightgray",
    paddingTop: '5px',
    marginTop: '5px'
}


// one node of the points tree (collapsed or expanded)
const TreeNode = props => {
    let content = null;
    if (props.node.expanded) {
        if (props.node.values && props.node.values.length > 0) {
            // it's a leaf node
            content = props.node.values.map(v =>
                <div key={v.docId}>
                    {formatPointValue(v.value)}
                    {" in doc "} {v.docId}
                </div>
            );
        }
        else if (props.node.children && props.node.children.length > 0) {
            content = props.node.children.map((n, idx) =>
                <TreeNode node={n} key={idx}
                          toggleTreeNode={props.toggleTreeNode} />
            );
        }
    }

    const toggle = props.node.expanded ?
      'glyphicon-triangle-bottom' : 'glyphicon-triangle-right';

    const label = props.node.valueCount ? 'Leaf node' : 'Tree node';

    return <div style={NODESTYLE}>
        <div>
            <a href="#" onClick={e => {
                e.preventDefault();
                props.toggleTreeNode(props.node, content == null)
            }}><span className={'glyphicon ' + toggle}
                    style={TOGGLESTYLE}></span>
                {label}: {formatPointValue(props.node.min)} {" - "}
                    {formatPointValue(props.node.max)}
                    {props.node.valueCount ?
                        " (" + props.node.valueCount + " values)" : ""}
            </a>
        </div>
        <div style={{ marginLeft: "20px" }}>
            {content}
        </div>
    </div>;
};

TreeNode.propTypes = {
    node: PropTypes.object.isRequired,
    toggleTreeNode: PropTypes.func.isRequired
};

export const EncodingDropdown = props => {
  const types = props.bytesPerDim == 4 ? ['binary', 'int', 'float'] :
    props.bytesPerDim == 8 ? ['binary', 'long', 'double'] : ['binary'];

  const items = types.map((type, idx) =>
      <MenuItem key={idx} eventKey={type}>{type}</MenuItem>
  );

  return <DropdownButton title={`Encoding: ${props.encoding}`}
                         id={'marple-type-dropdown'}
                         onSelect={props.onSelect}>
    {items}
  </DropdownButton>;
};

function formatPointValue(v) {
    if (Array.isArray(v) && v.length > 1) {
        return "[" +  v.join(", ") + "]"
    }
    else {
        return "" + v;
    }
}

// the points component
class Points extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            waiting: false,
            encoding: 'binary'
        };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.fetchTreeData = this.fetchTreeData.bind(this);
        this.toggleTreeNode = this.toggleTreeNode.bind(this);
        this.onError = this.onError.bind(this);
        this.setEncoding = this.setEncoding.bind(this);
    }

    onError(errmsg) {
        if (errmsg.includes('No points data for field')) {
            this.setState({ data: undefined });
        }
        else {
            this.props.showAlert(errmsg, true);
        }
    }

    componentDidMount() {
        this.fetchTreeData(this.props.segment, this.props.field, this.state.encoding);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.field !== this.props.field ||
            newProps.segment !== this.props.segment)
        {
            this.fetchTreeData(newProps.segment, newProps.field, this.state.encoding);
        }
    }

    fetchTreeData(segment, field, newEncoding) {
        if (segment === "") {
            this.setState({ data: null });
        } else {
            this.setState({ waiting: true });
            loadPointsTree(segment, field, newEncoding,
                (data, encoding) => {
                    if (encoding != newEncoding) {
                        this.props.showAlert(
                            `${newEncoding} is not a valid encoding for this field`);
                    }

                    this.expandToDepth(data.root, 3);
                    this.setState({ data, encoding, waiting: false });
                },
                error => {
                    this.setState({ data: null, waiting: false });
                    this.onError(error);
                }
            );
        }
    }

    expandToDepth(root, openLevels) {
        function visit(node, level) {
            node.expanded = true;
            if (level < openLevels && node.children) {
                node.children.forEach(n => {
                    visit(n, level + 1);
                });
            }
        }

        visit(root, 1);
    }

    toggleTreeNode(node) {
        const newState = {
            waiting: false,
            // Mutating existing state. Possibly dodgy.
            data: this.state.data
        };

        if (node.expanded != true) {
            node.expanded = true;

            // do we need to fetch values from server?
            if (node.valueCount && node.values === undefined) {
                this.setState({ waiting: true });

                newState.data = this.state.data;
                loadPointsValues(this.props.segment, this.props.field,
                    this.state.encoding, node.min, node.max,
                    (data, encoding) => {
                        node.values = data;
                        this.setState(newState);    // asynchronous
                    },
                    error => {
                        this.setState({ data: null, waiting: false });
                        this.onError(error);
                    }
                );
            }
            else {
                this.setState(newState);    // synchronous
            }
        }
        else {
            node.expanded = false;
            this.setState(newState);        // synchronous
        }
    }

    setEncoding(encoding) {
        this.fetchTreeData(this.props.segment, this.props.field, encoding);
    }

    render() {
        const s = this.state;
        const p = this.props;

        if (p.segment === "") {
            return <div style={{margin:'14px'}}>
                Select a segment to display points</div>;
        }

        if (s.data === undefined) {
            return <div style={{margin:'14px'}}>
                Field <em>{ p.field }</em> has no points data</div>;
        }

        if (s.data === null) {
            return s.waiting ? <Waiting/> : null;
        }

        return <div>
            <table style={{width:'100%', border:'0px', margin:'7px 0px 7px 14px'}}>
                <tbody>
                <tr>
                    <td style={LABELSTYLE}>Dimensions:</td>
                    <td style={{width:'auto'}}>{s.data.numDims}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Bytes per dimension:</td>
                    <td style={{width:'auto'}}>{s.data.bytesPerDim}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Min:</td>
                    <td style={{width:'auto'}}>{formatPointValue(s.data.root.min)}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Max:</td>
                    <td style={{width:'auto'}}>{formatPointValue(s.data.root.max)}</td>
                </tr>
                </tbody>
            </table>
            <Form>
                <EncodingDropdown encoding={s.encoding}
                                  bytesPerDim={s.data.bytesPerDim}
                                  onSelect={x => this.setEncoding(x)} />
            </Form>
            <div style={TREESTYLE}>
                <TreeNode node={s.data.root}
                          toggleTreeNode={this.toggleTreeNode} />
            </div>
            { s.waiting ? <Waiting/> : null }
        </div>;
    }
}

Points.propTypes = {
    segment: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number
    ]),
    field: PropTypes.string.isRequired,
    showAlert: PropTypes.func.isRequired
};

export default Points;
