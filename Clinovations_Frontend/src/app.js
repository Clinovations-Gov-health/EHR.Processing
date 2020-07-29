import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './routers/AppRouter';

import { Provider } from 'react-redux';

//const store = getAppStore();

const template = (
    <Provider>
        <AppRouter />
    </Provider>
);

// store.dispatch(getBooks()).then(() => {
    ReactDOM.render(template, document.getElementById('app'));
// });
