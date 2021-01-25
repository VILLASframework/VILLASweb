import React from 'react';
import {Button, Row, Col} from 'react-bootstrap';
import Dialog from '../common/dialogs/dialog';
import Icon from "../common/icon";
import ConfirmCommand from './confirm-command';
import JsonView from 'react-json-view';
import FileSaver from 'file-saver';


class ICDialog extends React.Component {
  valid = true;

  constructor(props) {
    super(props);

    this.state = {
      confirmCommand: false,
      command: '',
      icStatus: {}
    };
  }

  static getDerivedStateFromProps(props, state){
    if(typeof props.icStatus !== 'undefined'){
      return {icStatus: props.icStatus}
    } else {
      return {}
    }
  }

  onClose(canceled) {
    this.props.onClose();
  }

  handleChange(e) {
    
  }

  showFurtherInfo(key){
    if(typeof this.state[key] === 'undefined') this.setState({[key]: false});
    this.setState({[key]: !this.state[key]});
  }

  graphError(e){
    console.log("graph error");
  }

  closeConfirmModal(canceled){
    if(!canceled){
      this.props.sendControlCommand(this.state.command,this.props.ic);
    }

    this.setState({confirmCommand: false, command: ''});
  }

  downloadGraph(url){
    FileSaver.saveAs(url, this.props.ic.name + ".svg");    
}

  
  render() {

    let icStatus = this.state.icStatus;
    delete icStatus['icID'];

    let objectURL=''
    if(typeof this.props.icGraph !== "undefined") {
      objectURL = this.props.icGraph.objectURL
    }
    
    return (
      <Dialog
        show={this.props.show}
        title={this.props.ic.name}
        buttonTitle="Close"
        onClose={(c) => this.onClose(c)}
        valid={true}
        size='xl'
        blendOutCancel={true}
      >
        <form>
          <Row>
            <Col>
              <h5>Status:</h5>

              <JsonView
                src={icStatus}
                name={false}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                collapsed={true}
              />

            </Col>

            <Col>
              <div className='section-buttons-group-right'>
                <Button style={{ margin: '5px' }} size='sm' onClick={() => this.downloadGraph(objectURL)}><Icon icon="download" /></Button>
              </div>
              <h5>Graph:</h5>
              <div>
                {objectURL !== '' ? (
                  <img onError={(e) => this.graphError(e)} alt={"Error"} src={objectURL} />
                ) : (
                    <img alt="Error" />
                  )}
              </div>

              {this.props.userRole === "Admin" ? (
                <div>
                  <h5>Controls:</h5>
                  <div>
                    <Button style={{ margin: '5px' }} size='lg' onClick={() => this.setState({ confirmCommand: true, command: 'restart' })}>Restart</Button>
                    <Button style={{ margin: '5px' }} size='lg' onClick={() => this.setState({ confirmCommand: true, command: 'shutdown' })}>Shutdown</Button>
                  </div>
                </div>)
                : (<div></div>)}

              <ConfirmCommand show={this.state.confirmCommand} command={this.state.command} name={this.props.ic.name} onClose={c => this.closeConfirmModal(c)} />
            </Col>
          </Row>
        </form>
      </Dialog>

    );
  }
}

export default ICDialog;
