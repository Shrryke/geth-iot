import React, {Component} from "react";
import {Button, List, message, Select, Spin, Input, Tabs, Tooltip, notification} from "antd";
import {Link} from "react-router-dom";
import getWeb3j from "../utils/web3js";
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description
    });
};

class CheckSignatures extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account:"",
            pwd:"",
            web3:null,
            deviceId: this.props.match.params.deviceId,
            loading: true,
            instance: null,
            signatures:[],
            accountList:[1,2,3,4,5,6],
            hashList:[]
        }
        this.SignDevice=this.SignDevice.bind(this);
        this.watchForChanges=this.watchForChanges.bind(this);
    }

    async watchForChanges() {
        let result=await getWeb3j;
        var filter = result.web3.eth.filter('latest')
        filter.watch((error, result) => {
            if (!error) {
                openNotificationWithIcon('success', 'Transaction mined', 'Your device has been registered.');
                filter.stopWatching();
            }
        });
    }

    async componentDidMount() {
        try {
            console.log(this.state.deviceId);
            //let instance = await DeviceManager;
            //let signatureIds = (await instance.getActiveSignaturesForDevice(this.state.deviceId)).map(el => el.toNumber());

            let result=await getWeb3j;
            //投票列表
            let dict=result.web3.eth.getDelegate(this.state.deviceId);
            let accountList=result.web3.eth.accounts;

            let hashList = ["cd3376bb711cb332ee3fb2ca04c6a8b9f70c316fcdf7a1f44ef4c7999483295e",
                "1c6db65a3834a57319aff060462fc1dc410d93685dcd25dbc511667d2887c425"];
            //设备身份列表
            try{
                hashList = result.web3.eth.getCandidateValue(this.state.deviceId);
            }catch (e) {
                console.log(e);
            }

            let signatureIds=[];
            let signatures=[];
            console.log(signatures);

            for (let key in dict){
                signatureIds.push(key);
                signatures.push(dict[key]);
            }

            this.setState({
                //instance,
                web3:result,
                signatures,
                signatureIds,
                loading: false,
                accountList:accountList,
                account:accountList[0],
                hashList:hashList
            });
        } catch (error) {
            console.log(error);
            message.error(error.message);
        }
    }

    accountChange=(data)=>{
        console.log(data);
        this.setState({
            account:data
        })
    }

    pwdChange=(data)=>{
        this.setState({
            pwd:data.target.value
        })
    }


    async SignDevice(){
        let result=await getWeb3j;
        console.log(this.state.account);
        result.web3.personal.unlockAccount(this.state.account,this.state.pwd,(err,res)=>{
            if(err)
                console.log('Error',err)
            else{
                result.web3.eth.sendTransaction({
                    from:this.state.account,
                    to:this.state.deviceId,
                    type:3,
                    value:0
                });
                this.watchForChanges();
                openNotificationWithIcon('info', 'Transaction sent', 'Once mined, your device will be registered.');
            }
        });

    }

    render() {
        const { signatures, loading } = this.state;

        return (
            <div>
                <Spin spinning={loading} className="loading-spin">
                    {signatures.length > 0 && !loading &&
                    <div>
                        <p>
                            Below you can find your devices. Click to see more details and manage.
                        </p>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="设备基本信息" key="1">
                                {/*<Search*/}
                                {/*    placeholder="input another name"*/}
                                {/*    enterButton="confirm"*/}
                                {/*    size="default"*/}
                                {/*    onSearch={value => console.log(value)}*/}
                                {/*/>*/}
                                <Tooltip title="DeviceAddress">
                                    <span>DeviceAddress: {this.state.deviceId}</span>
                                </Tooltip>
                                <p></p>
                                <Tooltip title="MetadataHash">
                                    <span>MetadataHash: {this.state.hashList[0]}</span>
                                </Tooltip>
                                <p></p>
                                <Tooltip title="FirmwareHash">
                                    <span>FirmwareHash: {this.state.hashList[1]}</span>
                                </Tooltip>
                            </TabPane>
                            <TabPane tab="投票人列表" key="2">
                                <List
                                    bordered={true}
                                    itemLayout="horizontal"
                                    dataSource={signatures}
                                    renderItem={(signature, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                /*avatar={<Icon type="profile" style={{ fontSize: 36 }} />}*/
                                                title={<Link to={`/check-signature/${this.state.signatureIds[index]}`}>{`Signature ID ${this.state.signatureIds[index]}`}</Link>}
                                                description={`Weight ${this.state.signatures[index]}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        </Tabs>

                        <p></p>
                    <Select
                        style={{ width: 'calc(20%)' }}
                            onChange={this.accountChange}
                            placeholder="Select a person"
                           defaultValue={this.state.accountList[0]}
                        >
                        {this.state.accountList.map(item => <Option key={item}>{item}</Option>)}
                    </Select>
                        <p></p>
                        <Input
                            onChange={this.pwdChange}
                            style={{ width: 'calc(20%)' }}
                            addonBefore="密码"/>
                        <p></p>
                        <Button type="primary" onClick={this.SignDevice}>Sign it</Button>
                    </div>
                    }
                    {signatures.length === 0 && !loading &&
                    <p>You don't have any signatures in this device.</p>
                    }
                </Spin>
            </div>
        )
    }
}

export default CheckSignatures;
