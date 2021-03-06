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

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import { Button } from 'react-bootstrap';

import AppDispatcher from '../common/app-dispatcher';
import UsersStore from './users-store';

import Icon from '../common/icon';
import Table from '../common/table';
import TableColumn from '../common/table-column';
import NewUserDialog from './new-user';
import EditUserDialog from './edit-user';

import DeleteDialog from '../common/dialogs/delete-dialog';
import NotificationsDataManager from "../common/data-managers/notifications-data-manager";

class Users extends Component {
  static getStores() {
    return [ UsersStore ];
  }

  static calculateState(prevState, props) {

    let token = localStorage.getItem("token");

    // If there is a token available and this method was called as a result of loading users
    if (!prevState && token) {
      AppDispatcher.dispatch({
        type: 'users/start-load',
        token: token
      });
    }

    return {
      token: token,
      users: UsersStore.getState(),

      newModal: false,
      editModal: false,
      deleteModal: false,
      modalData: {}
    };
  }

  closeNewModal(data) {
    this.setState({ newModal: false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'users/start-add',
        data: data,
        token: this.state.token
      });
    }
  }

  closeDeleteModal(confirmDelete) {
    this.setState({ deleteModal: false });

    if (confirmDelete === false) {
      return;
    }

    AppDispatcher.dispatch({
      type: 'users/start-remove',
      data: this.state.modalData,
      token: this.state.token
    });
  }

  closeEditModal(data) {
    this.setState({ editModal: false });

    if (data) {
      if(data.password === data.confirmpassword) {

        AppDispatcher.dispatch({
          type: 'users/start-edit',
          data: data,
          token: this.state.token
        });
      } else{
        const USER_UPDATE_ERROR_NOTIFICATION = {
          title: 'Update Error ',
          message: 'New password not correctly confirmed',
          level: 'error'
        };
        NotificationsDataManager.addNotification(USER_UPDATE_ERROR_NOTIFICATION)
      }
    }
  }

  getHumanRoleName(role_key) {
    const HUMAN_ROLE_NAMES = {Admin: 'Administrator', User: 'User', Guest: 'Guest'};

    return HUMAN_ROLE_NAMES.hasOwnProperty(role_key)? HUMAN_ROLE_NAMES[role_key] : '';
  }

  onModalKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      this.confirmDeleteModal();
    }
  };

  modifyActiveColumn(active){

    if(active){
      return <Icon icon='check' />
    } else {
      return <Icon icon='times' />
    }

  }

  render() {

    return (
      <div>
        <h1>Users</h1>

        <Table data={this.state.users}>
          <TableColumn title='Username' width='150' dataKey='username' />
          <TableColumn title='ID' width='150' dataKey='id' />
          <TableColumn title='E-mail' dataKey='mail'  />
          <TableColumn title='Role' dataKey='role'  modifier={(role) => this.getHumanRoleName(role)} />
          <TableColumn title='Active' dataKey='active' modifier={(active) => this.modifyActiveColumn(active)} />
          <TableColumn width='200' editButton deleteButton onEdit={index => this.setState({ editModal: true, modalData: this.state.users[index] })} onDelete={index => this.setState({ deleteModal: true, modalData: this.state.users[index] })} />
        </Table>

        <Button onClick={() => this.setState({ newModal: true })}><Icon icon='plus' /> User</Button>

        <NewUserDialog show={this.state.newModal} onClose={(data) => this.closeNewModal(data)} />
        <EditUserDialog show={this.state.editModal} onClose={(data) => this.closeEditModal(data)} user={this.state.modalData} />

        <DeleteDialog title="user" name={this.state.modalData.username} show={this.state.deleteModal} onClose={(e) => this.closeDeleteModal(e)} />
      </div>
    );
  }
}

let fluxContainerConverter = require('../common/FluxContainerConverter');
export default Container.create(fluxContainerConverter.convert(Users));
