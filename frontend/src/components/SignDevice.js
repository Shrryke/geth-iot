import React, { Component } from 'react';
import {Button, Input, message, notification} from "antd";
import getWeb3 from "../utils/web3";
import DeviceManager, {getDefaultAccount} from "../DeviceManager";
import {aop} from "../DeviceManager";

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description
    });
};

class SignDevice extends Component {

    constructor(props) {
        super(props);

        this.state = {
            deviceId:"",
            expireTime:"",
        }
        this.SignDevice=this.SignDevice.bind(this)
    }


    async componentWillMount() {
        try {
            let results = await getWeb3;
            let instance = await DeviceManager;

            this.setState({
                web3: results.web3,
                instance
            });


        } catch (error) {
            console.log(error);
            message.error(error.message);
        }
    }

    async SignDevice() {
        const deviceId=this.state.deviceId;
        const expireTime=this.state.expireTime;
        let instance = await DeviceManager;

        aop(instance.signDevice(deviceId,expireTime,{ from: getDefaultAccount() }))

        //await instance.signDevice(deviceId,expireTime,{ from: getDefaultAccount() });
        this.watchForChanges(deviceId);

    }

    watchForChanges(property) {
        let filter = this.state.web3.eth.filter('latest', (error, result) => {
            if (!error) {
                openNotificationWithIcon('success', 'Transaction mined', `DeviceId ${property.value} has been Signed.`);
                this.state.filter.stopWatching();
            } else {
                console.error(error);
            }
        });

        this.setState({
            filter
        })
    }


    input_device_id_change(e){
        this.setState(
            {deviceId:e.target.value}
        )
    }
    input_expire_time_change(e){
        this.setState(
            {expireTime:e.target.value}
        )
    }


    render() {
        return (
            <div>
                <p>
                    Sign for any device.
                </p>
                <Input
                    placeholder="Device ID"
                    onChange={this.input_device_id_change.bind(this)}
                />
                <p></p>
                <Input
                    placeholder="Expire Time"
                    onChange={this.input_expire_time_change.bind(this)}
                />
                <p></p>
                <Button type="primary" onClick={this.SignDevice}>Sign it</Button>
            </div>
        )
    }
}

export default SignDevice;