import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { render} from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { problem } from '../api/db.js';

import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Divider from 'material-ui/lib/divider';
import DashboardIcon from 'material-ui/lib/svg-icons/action/dashboard';
import AdminIcon from 'material-ui/lib/svg-icons/action/settings';
import AboutIcon from 'material-ui/lib/svg-icons/action/code';
import LogoutIcon from 'material-ui/lib/svg-icons/action/exit-to-app';

import Timer from './Timer.jsx';
import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import Admin from './admin.jsx';
import ProblemEditor from './problemEditor.jsx';

injectTapEventPlugin(); //Workaround for Meterial-UI with React verion under 1.0

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open : false,
            sectionState: 'login'
        };
    }
    navOpen () {
        this.setState({open:true});
    }
    navClose () {
        this.setState({open:false});
    }
    logout () {
        Meteor.logout((err)=>{
            this.navClose();
            if (err) {
                console.log(err);
            }
        });
    }
    adminPage () {
        this.setState({sectionState: 'admin'});
        this.navClose();
    }
    renderSection () {
        const sectionDOM = document.getElementById('section');
        if (this.props.currentUser) {
            switch (this.state.sectionState) {
            case 'admin':
                render(React.createElement(Admin), sectionDOM);
                break;
            case 'dashboard':
                render(React.createElement(Dashboard), sectionDOM);
                break;
            case 'problemEditor':
                render(<ProblemEditor data={this.state.problem}/>, sectionDOM);
                break;
            default:
                render(React.createElement(Dashboard), sectionDOM);
            }
        } else {
            render(React.createElement(Login), sectionDOM);
        }
    }
    dashboard () {
        this.setState({sectionState: 'dashboard'});
        this.navClose();
    }
    renderProblemEditor (problem) {
        this.setState({sectionState: 'problemEditor', problem: problem});
        this.navClose();
    }
    renderProblems () {
        return this.props._problem.map((problem, key) => (
            <MenuItem key={key} leftIcon={<AboutIcon />} onTouchTap={this.renderProblemEditor.bind(this, problem)}>
                {problem.title}
            </MenuItem>
        ));
    }
    componentDidMount () {
        this.renderSection();
    }
    componentDidUpdate () {
        this.renderSection();
    }
    render () {
        return (
            <div>
                <AppBar title="Sapporo" onTouchTap={this.navOpen.bind(this)}>
                </AppBar>
                <LeftNav  docked={false} open={this.state.open}
                          onRequestChange={this.navClose.bind(this)}>
                    <MenuItem leftIcon={<DashboardIcon />} onTouchTap={this.dashboard.bind(this)}>Dashboard</MenuItem>
                    <MenuItem leftIcon={<AdminIcon />} onTouchTap={this.adminPage.bind(this)}>Admin Config</MenuItem>
                    <MenuItem leftIcon={<AboutIcon />}>About</MenuItem>
                    <Divider />
                    <MenuItem leftIcon={<LogoutIcon />} onTouchTap={this.logout.bind(this)}>Log Out</MenuItem>
                    <Divider />
                    <MenuItem>problem</MenuItem>
                    {this.renderProblems()}
                </LeftNav>
                <div id="section"></div>
            </div>
        );
    }
}


Main.propTypes = {
    currentUser: PropTypes.object,
    _problem: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('problem');
    return {
        currentUser: Meteor.user(),
        _problem: problem.find({}).fetch()
    };
}, Main);
