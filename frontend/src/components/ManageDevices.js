import React, { Component } from 'react';
import {Spin, List, message, Button} from 'antd';
import { Link } from 'react-router-dom';
import getWeb3j from "../utils/web3js";

class ManageDevices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      instance: null,
      devices: [],
      balances:[]
    }
  }

  async componentDidMount() {
    try {
      //let instance = await DeviceManager;
      //let deviceIds = (await instance.getDevicesByOwner(getDefaultAccount())).map(el => el.toNumber());

      // let devicePromises = [];
      // for (let deviceId of deviceIds) {
      //   let devicePromise = instance.devices(deviceId);
      //   devicePromises.push(devicePromise);
      // }
      //
      // let devices = await Promise.all(devicePromises);

      let results=await getWeb3j;

      this.setState({
        web3: results.web3,
        //instance,
      });




      let deviceIds=results.web3.eth.accounts;
      let devices=deviceIds;
      let balances=[]
      for (let i = 0; i < deviceIds.length; i++) {
        balances.push(results.web3.eth.getBalance(deviceIds[i]))
      }

      this.setState({
        //instance,
        devices,
        deviceIds,
        loading: false,
        balances:balances
      });
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  render() {
    const { devices, loading } = this.state;

    return (
      <div>
        <Spin spinning={loading} className="loading-spin">
          {devices.length > 0 && !loading &&
            <div>
              <p>
                Below you can find your devices. Click to see more details and manage.
              </p>
              <List
                bordered={true}
                itemLayout="horizontal"
                dataSource={devices}
                renderItem={(device, index) => (
                  <List.Item>
                    <List.Item.Meta
                      /*avatar={<Icon type="profile" style={{ fontSize: 36 }} />}*/
                      title={<Link to={`/check-signatures/${this.state.deviceIds[index]}`}>{`Device ID ${this.state.deviceIds[index]}`}</Link>}
                      description={`Balance ${this.state.balances[index]}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          }
          {devices.length === 0 && !loading &&
            <p>You don't have any devices registered.</p>
          }
        </Spin>
      </div>
    )
  }
}

export default ManageDevices;
