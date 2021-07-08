// import './App.css';
import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
// import logo from './logo.svg';
import Meetingpage  from './component/Meetingpage.js';
import Landingpage from './component/Landingpage.js';
import Notavailable from './component/Notavailable.js';
import Joinmeeting from './component/Joinmeeting.js';
import Chatpage from './component/Chatpage.js';
function App() {
  return (
    <Router>
      <Switch>
      <Route exact path="/" component={Landingpage}>
      </Route>
      <Route exact path="/:id" component={Joinmeeting}>
      </Route>
      <Route path="/:id/:name/:chat" component={Chatpage}>
      </Route>
      <Route path="/:id/:name" component={Meetingpage}>
      </Route>
      <Route path="*" component={Notavailable}>
      </Route>
      </Switch>
    </Router>
  );
}

export default App;