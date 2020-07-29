import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import PatientView from '../components/PatientVew';

const AppRouter = () => (
    <BrowserRouter>
        <div className='container'>
            <Switch>
                <Route path="/" component={PatientView} exact={true} />
            </Switch>
        </div>
    </BrowserRouter>
);

export default AppRouter;