import React, {Component} from "react";
import {Button, List, message, Spin, Statistic} from "antd";
import {Link} from "react-router-dom";

import getWeb3j from '../utils/web3js';



class Candidates extends Component {
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

            var dict=result.web3.eth.getCandidate();
            let deviceIds=[];
            let devices=[];


            //var dic={"a":3,"b":6,"c":2};
            var sdic=Object.keys(dict).sort(function(a,b){return dict[a]-dict[b]}).reverse();

            for (var key in sdic){
                deviceIds.push(sdic[key]);
                devices.push(dict[sdic[key]]);
            }


            // let deviceIds=result.web3.eth.getValidators();
            //
            //
            // let devicePromises = [];
            // for (let deviceId of deviceIds) {
            //     //let devicePromise = instance.devices(deviceId);
            //     let devicePromise="divice"+deviceId;
            //     devicePromises.push(devicePromise);
            // }
            //
            // let devices = await Promise.all(devicePromises);

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

        const {Countdown} = Statistic;

        const today = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);

        return (
            <div>
                <Spin spinning={loading} className="loading-spin">
                    {devices.length > 0 && !loading &&
                    <div>
                        <p>
                            候选人列表  前三票数将成为新周期(一天)的验证人
                            <Countdown title="距离下次选举生效时间" value={today}  format="HH 时 mm 分 ss 秒" />
                        </p>

                        <List
                            bordered={true}
                            itemLayout="horizontal"
                            dataSource={devices}
                            renderItem={(device, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        /*avatar={<Icon type="profile" style={{ fontSize: 36 }} />}*/
                                        title={<Link to={`/check-signatures/${this.state.deviceIds[index]}`}>{`Account ${this.state.deviceIds[index]}`}</Link>}
                                        description={`vote ${this.state.devices[index]}`}
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

export default Candidates;
