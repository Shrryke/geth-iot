import React, {Component} from "react";
import {List, message, Spin} from "antd";
import {Link} from "react-router-dom";

import getWeb3j from '../utils/web3js';

class CheckDevice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            instance: null,
            devices: []
        }
    }

    async componentDidMount() {
        try {
            //let instance = await DeviceManager;
            //let deviceIds = (await instance.getDevicesByOwner(getDefaultAccount())).map(el => el.toNumber());
            let result=await getWeb3j;


            let deviceIds=result.web3.eth.getValidators();


            console.log(localStorage.getItem('1'));

            let devicePromises = [];
            for (let deviceId of deviceIds) {
                //let devicePromise = instance.devices(deviceId);
                let devicePromise="divice"+deviceId;
                devicePromises.push(devicePromise);
            }

            let devices = await Promise.all(devicePromises);

            this.setState({
                //instance,
                devices,
                deviceIds,
                loading: false
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
                                        title={`Device ID ${this.state.deviceIds[index]}`}
                                        // description={`identifier ${device[1]}`}
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

export default CheckDevice;
