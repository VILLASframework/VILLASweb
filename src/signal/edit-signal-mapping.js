/**
 * This file is part of VILLASweb.
 *
 * VILLASweb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VILLASweb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with VILLASweb. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import {Button, FormGroup, FormLabel, FormText} from 'react-bootstrap';
import {Collapse} from 'react-collapse';
import Table from '../common/table';
import TableColumn from '../common/table-column';
import Dialog from "../common/dialogs/dialog";
import Icon from "../common/icon";
import AppDispatcher from "../common/app-dispatcher";

class EditSignalMapping extends React.Component {

  constructor(props) {
    super(props);

    let dir = "";
    if ( this.props.direction === "Output"){
      dir = "out";
    } else if ( this.props.direction === "Input" ){
      dir = "in";
    }


    this.state = {
      dir,
      signals: [],
      modifiedSignalIDs : [],
      openCollapse: false
    };
  }

  static getDerivedStateFromProps(props, state){

    // filter all signals by configID and direction
    let signals = [];
    if(props.signalID != null || typeof props.configs === "undefined"){
      signals = props.signals.filter((sig) => {
        return (sig.configID === props.configID) && (sig.direction === state.dir);
      });
    }
    else{
      for(let i = 0; i < props.configs.length; i++){
        let temp = props.signals.filter((sig) => {
          return (sig.configID === props.configs[i].id) && (sig.direction === state.dir);
        })
      signals = signals.concat(temp);
    }
  }

    return {
      signals: signals,
    };
  }


  onClose(canceled) {

    for (let signalID of this.state.modifiedSignalIDs){

      let sig = this.state.signals.find(s => s.id === signalID);

      //dispatch changes to signal
      AppDispatcher.dispatch({
        type: 'signals/start-edit',
        data: sig,
        token: this.props.sessionToken,
      });
    }

    this.props.onCloseEdit(this.state.dir)
  }

  handleMappingChange = (event, row, column) => {

    let signals = this.state.signals;
    let modifiedSignals = this.state.modifiedSignalIDs;


      if (column === 1) { // Name change
        signals[row].name = event.target.value;
        if (modifiedSignals.find(id => id === signals[row].id) === undefined){
          modifiedSignals.push(signals[row].id);
        }
      } else if (column === 2) { // unit change
        signals[row].unit = event.target.value;
        if (modifiedSignals.find(id => id === signals[row].id) === undefined){
          modifiedSignals.push(signals[row].id);
        }
      } else if (column === 3) { // scaling factor change
        signals[row].scalingFactor = parseFloat(event.target.value);
        if (modifiedSignals.find(id => id === signals[row].id) === undefined){
          modifiedSignals.push(signals[row].id);
        }
      } else if (column === 0) { //index change
        signals[row].index =parseInt(event.target.value, 10);
        if (modifiedSignals.find(id => id === signals[row].id) === undefined){
          modifiedSignals.push(signals[row].id);
        }
      }

      this.setState({
        signals: signals,
        modifiedSignalIDs: modifiedSignals
      })

  };

  handleDelete = (index) => {

    let data = this.state.signals[index]

    AppDispatcher.dispatch({
      type: 'signals/start-remove',
      data: data,
      token: this.props.sessionToken
    });

  };

  handleAdd = (configID = null) => {

    if(typeof this.props.configs !== "undefined"){

      if(configID === null){
        this.setState({openCollapse: true});
        return
        }
      }
      else{
        configID = this.props.configID;
      }
    let newSignal = {
      configID: configID,
      direction: this.state.dir,
      name: "PlaceholderName",
      unit: "PlaceholderUnit",
      index: 999,
      scalingFactor: 1.0
    };

    AppDispatcher.dispatch({
      type: 'signals/start-add',
      data: newSignal,
      token: this.props.sessionToken
    });

    this.setState({openCollapse: false});
  };

  resetState() {

      let signals = this.props.signals.filter((sig) => {
        return (sig.configID === this.props.configID) && (sig.direction === this.state.dir);
      });

      this.setState({signals: signals})
  }

  render() {

      const buttonStyle = {
        marginLeft: '10px'
      };

      return(

        <Dialog
          show={this.props.show}
          title="Edit Signal Mapping"
          buttonTitle="Save"
          blendOutCancel = {true}
          onClose={(c) => this.onClose(c)}
          onReset={() => this.resetState()}
          valid={true}
          size='lg'>

          <FormGroup>
              <FormLabel>{this.props.direction} Mapping</FormLabel>
              <FormText>Click <i>Index</i>, <i>Name</i> or <i>Unit</i> cell to edit</FormText>
              <Table data={this.state.signals}>
                  <TableColumn title='Index' dataKey='index' inlineEditable inputType='number' onInlineChange={(e, row, column) => this.handleMappingChange(e, row, column)} />
                  <TableColumn title='Name' dataKey='name' inlineEditable inputType='text' onInlineChange={(e, row, column) => this.handleMappingChange(e, row, column)} />
                  <TableColumn title='Unit' dataKey='unit' inlineEditable inputType='text' onInlineChange={(e, row, column) => this.handleMappingChange(e, row, column)} />
                  <TableColumn title='Scaling Factor' dataKey='scalingFactor' inlineEditable inputType='number' onInlineChange={(e, row, column) => this.handleMappingChange(e, row, column)} />
                  <TableColumn title='Remove' deleteButton onDelete={(index) => this.handleDelete(index)} />
              </Table>

              <div style={{ float: 'right' }}>
                <Button key={50} onClick={() => this.handleAdd()} style={buttonStyle}><Icon icon="plus" /> Signal</Button>
              </div>
              <div>
                <Collapse isOpened={this.state.openCollapse}>
                <h6>Choose a Component Configuration to add the signal to: </h6>
                <div>
                {typeof this.props.configs !== "undefined" && this.props.configs.map(config => (

                  <Button key ={config.id} onClick={() => this.handleAdd(config.id)} style={buttonStyle}>{config.name}</Button>

                ))}
                </div>
                </Collapse> 
              </div>
          </FormGroup>
        </Dialog>
  );
  }
}

EditSignalMapping.propTypes = {
    name: PropTypes.string,
    length: PropTypes.number,
    signals: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            unit: PropTypes.string.isRequired,
            direction: PropTypes.string.isRequired,
            configID: PropTypes.number.isRequired,
            index: PropTypes.number.isRequired

        })
    ),
    onChange: PropTypes.func
};

export default EditSignalMapping;
