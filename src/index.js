/**
 * File: index.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 02.03.2017
 * Copyright: 2017, Institute for Automation of Complex Power Systems, EONERC
 *   This file is part of VILLASweb. All Rights Reserved. Proprietary and confidential.
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 **********************************************************************************/

import React from 'react';
import ReactDOM from 'react-dom';

import Router from './router';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/index.css';

ReactDOM.render(
  <Router />,
  document.getElementById('root')
);
