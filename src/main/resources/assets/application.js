var indexData = { "index" : "/path/to/index" };

var fieldsData = [
    "field1" , "field2", "field3"
];

var NavBar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Col = ReactBootstrap.Col;

var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;

var MarpleNav = React.createClass({
    render: function() {
        return (
            <NavBar>
                <NavBar.Header>
                    <NavBar.Brand>
                        <a href="#">Marple</a>
                    </NavBar.Brand>
                </NavBar.Header>
                <NavBar.Text pullRight>
                    Exploring lucene index: {this.props.indexData.indexpath}
                </NavBar.Text>
            </NavBar>
        )
    }
});

function segmentFilter(segment) {
    if (segment == 0)
        return "";
    return "?segment=" + (segment - 1);
}

function loadFieldsData(segment, renderFunc) {
    $.ajax({
        url: "http://localhost:8080/api/fields" + segmentFilter(segment),
        dataType: 'json',
        success: function(data) {
            renderFunc(data);
        }
    });
}

function loadTermsData(segment, field, renderFunc) {
    $.ajax({
        url: "http://localhost:8080/api/terms/" + field + segmentFilter(segment),
        dataType: 'json',
        success: function(data) {
            renderFunc(data);
        }
    });
}

var Fields = React.createClass({
    render: function() {
        var fieldtabs = this.props.fields.map(function(f, i) {
            return (<NavItem eventKey={f.name}>{f.name}</NavItem>);
        });
        return (
            <Nav bsStyle="pills" stacked onSelect={this.props.onSelect}
                 activeKey={this.props.selected}>{fieldtabs}</Nav>
        );
    }
});

var Segments = React.createClass({
    render: function() {
        var segmenttab = this.props.segments.map(function(f, i) {
            var name = "Segment " + f.ord;
            return (<NavItem eventKey={i + 1}>{name}</NavItem>);
        });
        segmenttab.unshift(<NavItem eventKey={0}>All segments</NavItem>);
        return (
            <Nav bsStyle="pills" stacked onSelect={this.props.onSelect}
                 activeKey={this.props.selected}>{segmenttab}</Nav>
        )
    }
});

var MarpleContent = React.createClass({
    getInitialState: function() {
        return {
            indexData: { indexpath: "loading", generation: -1, segments: []},
            fieldsData: [],
            selectedField: undefined,
            selectedSegment: undefined
        }
    },
    componentDidMount: function() {
        $.ajax({
            url: "http://localhost:8080/api/index",
            dataType: 'json',
            success: function(data) {
                this.setState({ indexData: data});
            }.bind(this)
        });
    },
    selectSegment: function(segNumber) {
        loadFieldsData(segNumber, function(fieldsData) {
            this.setState({ fieldsData: fieldsData, selectedSegment: segNumber, selectedField: undefined } );
        }.bind(this))
    },
    selectField: function(fieldName) {
        loadTermsData(this.state.selectedSegment, fieldName, function(termsData) {
            this.setState({ termsData: termsData, selectedField: fieldName});
        }.bind(this))
    },
    render: function() {
        return (
            <div>
                <MarpleNav indexData={this.state.indexData}/>
                <Col md={2}>
                    <Segments segments={this.state.indexData.segments} onSelect={this.selectSegment}
                              selected={this.state.selectedSegment}/>
                </Col>
                <Col md={2}>
                    <Fields fields={this.state.fieldsData} onSelect={this.selectField}
                            selected={this.state.selectedField}/>
                </Col>
                <Col md={6}>
                    <FieldData field={this.state.selectedField} termsData={this.state.termsData}/>
                </Col>
            </div>
        )
    }
});

var TermsData = React.createClass({
    render: function() {
        var termsList = this.props.terms.map(function(term) {
            return (<NavItem>{term}</NavItem>)
        });
        return (
            <Nav>{termsList}</Nav>
        );
    }
});

var FieldData = React.createClass({
    render: function() {
        if (this.props.field == undefined) {
            return (<div/>)
        }
        return (
            <div>
                <Nav bsStyle="tabs" justified activeKey="terms">
                    <NavItem eventKey="terms">Terms</NavItem>
                    <NavItem eventKey="docvalues">DocValues</NavItem>
                    <NavItem eventKey="points">Points</NavItem>
                </Nav>
                <TermsData terms={this.props.termsData}/>
            </div>
        );
    }
});

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));