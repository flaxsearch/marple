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

var Fields = React.createClass({
    render: function() {
        var fieldtabs = this.props.fields.map(function(f, i) {
            return (<NavItem eventKey={i}>{f.name}</NavItem>);
        });
        return (
            <Nav bsStyle="pills" stacked>{fieldtabs}</Nav>
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
            <Nav bsStyle="pills" stacked onSelect={this.props.onSelect}>{segmenttab}</Nav>
        )
    }
});

var MarpleContent = React.createClass({
    getInitialState: function() {
        return {
            indexData: { indexpath: "loading", generation: -1, segments: []},
            fieldsData: []
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
            this.setState({ fieldsData: fieldsData} );
        }.bind(this))
    },
    selectField: function(fieldName) {

    },
    render: function() {
        return (
            <div>
                <MarpleNav indexData={this.state.indexData}/>
                <Col md={2}>
                    <Segments segments={this.state.indexData.segments} onSelect={this.selectSegment}/>
                </Col>
                <Col md={2}>
                    <Fields fields={this.state.fieldsData} onSelect={this.selectField}/>
                </Col>
                <Col md={6}>
                    <FieldData/>
                </Col>
            </div>
        )
    }
});

var FieldData = React.createClass({
    render: function() {
        return (<h3>Field data goes here</h3>);
    }
});

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));