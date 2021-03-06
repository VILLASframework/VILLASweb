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
import {FormGroup, FormControl, FormLabel} from 'react-bootstrap';
import  { Multiselect } from 'multiselect-react-dropdown'
import Dialog from '../common/dialogs/dialog';
import ParametersEditor from '../common/parameters-editor';

class EditConfigDialog extends React.Component {
  valid = false;

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      icID: '',
      startParameters: {},
      selectedFiles: [] // list of selected files {name, id}, this is not the fileIDs list of the config!
    };
  }

  onClose(canceled) {
    if (canceled === false) {
      if (this.valid) {
        let data = this.props.config;
        if (this.state.name !== '' && this.props.config.name !== this.state.name) {
          data.name = this.state.name;
        }
        if (this.state.icID !== '' && this.props.config.icID !== parseInt(this.state.icID)) {
          data.icID = parseInt(this.state.icID, 10);
        }
        if(this.state.startParameters !==  {} &&
          JSON.stringify(this.props.config.startParameters) !== JSON.stringify(this.state.startParameters)){
          data.startParameters = this.state.startParameters;
        }

        let IDs = []
        for(let e of this.state.selectedFiles){
          IDs.push(e.id)
        }
        if(this.props.config.fileIDs !== null && this.props.config.fileIDs !== undefined) {
          if (JSON.stringify(IDs) !== JSON.stringify(this.props.config.fileIDs)) {
            data.fileIDs = IDs;
          }
        }
        else{
          data.fileIDs = IDs
        }

        //forward modified config to callback function
        this.props.onClose(data)
      }
    } else {
      this.props.onClose();
    }
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
    this.valid = this.isValid()
  }

  handleParameterChange(data) {
    if (data) {
      this.setState({startParameters: data});
    }
    this.valid = this.isValid()
  }

  onFileChange(selectedList, changedItem) {
    this.setState({
      selectedFiles: selectedList
    })
    this.valid = this.isValid()
  }


  isValid() {
    // input is valid if at least one element has changed from its initial value
    return this.state.name !== ''
      || this.state.icID !== ''
      || this.state.startParameters !== {}
  }

  resetState() {

    // determine list of selected files incl id and filename
    let selectedFiles = []
    if(this.props.config.fileIDs !== null && this.props.config.fileIDs !== undefined) {
      for (let selectedFileID of this.props.config.fileIDs) {
        for (let file of this.props.files) {
          if (file.id === selectedFileID) {
            selectedFiles.push({name: file.name, id: file.id})
          }
        }
      }
    }

    this.setState({
      name: this.props.config.name,
      icID: this.props.config.icID,
      startParameters: this.props.config.startParameters,
      selectedFiles: selectedFiles,
    });
  }


  render() {
    const ICOptions = this.props.ics.map(s =>
      <option key={s.id} value={s.id}>{s.name}</option>
    );

    let configFileOptions = [];
    for(let file of this.props.files) {
      configFileOptions.push(
        {name: file.name, id: file.id}
      );
    }

    return (
      <Dialog
        show={this.props.show}
        title="Edit Component Configuration"
        buttonTitle="Save"
        onClose={(c) => this.onClose(c)}
        onReset={() => this.resetState()}
        valid={this.valid}
      >
        <form>
          <FormGroup controlId="name">
            <FormLabel column={false}>Name</FormLabel>
            <FormControl
              type="text"
              placeholder={this.props.config.name}
              value={this.state.name}
              onChange={(e) => this.handleChange(e)}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId="icID">
            <FormLabel column={false}> Infrastructure Component </FormLabel>
            <FormControl
              as="select"
              placeholder='Select infrastructure component'
              value={this.state.icID}
              onChange={(e) => this.handleChange(e)}
            >
              {ICOptions}
            </FormControl>
          </FormGroup>

          <Multiselect
            options={configFileOptions}
            showCheckbox={true}
            selectedValues={this.state.selectedFiles}
            onSelect={(selectedList, selectedItem) => this.onFileChange(selectedList, selectedItem)}
            onRemove={(selectedList, removedItem) => this.onFileChange(selectedList, removedItem)}
            displayValue={'name'}
            placeholder={'Select file(s)...'}
          />

          <FormGroup controlId='startParameters'>
            <FormLabel> Start Parameters </FormLabel>
            <ParametersEditor
              content={this.state.startParameters}
              onChange={(data) => this.handleParameterChange(data)}
            />
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}

export default EditConfigDialog;
