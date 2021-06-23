// import './App.css';
import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
// import logo from './logo.svg';
import Meetingpage  from './component/Meetingpage.js';
import Landingpage from './component/Landingpage.js';
import Notavailable from './component/Notavailable.js';

function App() {
  return (
    <Router>
      <Switch>
      <Route exact path="/">
        <Landingpage />
      </Route>
      <Route path="/:id">
        <Meetingpage />
      </Route>
      <Route path="*">
        <Notavailable />
      </Route>
      </Switch>
    </Router>
  );
}

export default App;