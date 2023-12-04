
import React, {Component, useDebugValue} from 'react';

import {Input, Divider, Select, Button, message,Tabs} from 'antd';
import getWeb3j from "../utils/web3js";
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

class LookupDevice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      devices:[],
      balances:[],
      searched: false,
      pwd:"",
      from:"",
      to:"",
      value:0,
    }
  }

  inputChange=(event)=>{
    console.log(event.target.value);
    //把表单输入的值赋值给username
    this.setState({
      pwd:event.target.value
    })
  }

  fromChange=(event)=>{
    this.setState({
      from:event
    })
  }

  toChange=(event)=>{
    this.setState({
      to:event
    })
  }

  valueChange=(event)=>{
    this.setState({
      value:event.target.value
      }
    )
  }

  sendTransaction=async()=>{
    let results = await getWeb3j;
    console.log(this.state.from)
    console.log(this.state.to)
    console.log(this.state.value)
    await results.web3.personal.unlockAccount(this.state.from,this.state.pwd,(err,res)=>{
      if(err)
        alert(err)
      else{
        results.web3.eth.sendTransaction({
          from:this.state.from,
          to:this.state.to,
          value:this.state.value
        });
        alert("发送成功，等待挖矿确认")
      }
    });
  }



  createAccount=async () => {
    let results = await getWeb3j;
    alert(results.web3.personal.newAccount(this.state.pwd))
  }

  async componentDidMount() {
    try {

      let results=await getWeb3j;


      let deviceIds=results.web3.eth.accounts;
      let devices=deviceIds;
      let balances=[]
      for (let i = 0; i < deviceIds.length; i++) {
        balances.push(results.web3.eth.getBalance(deviceIds[i]))
      }


      this.setState({
        devices:devices,
        balances:balances
      });
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }



  render() {
    return (
      <div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="转账" key="1">
            from:<Select
              style={{ width: 'calc(20%)' }}
              showSearch
              placeholder="Select a person"
              onChange={this.fromChange}
          >
            {this.state.devices.map(item => <Option key={item}>{item}</Option>)}
          </Select>
            <p></p>
            <Input
                onChange={this.inputChange}
                style={{ width: 'calc(20%)' }}
                addonBefore="密码"/>
            <p></p>
            to:<Select
              style={{ width: 'calc(20%)' }}
              showSearch
              placeholder="Select a person"
              onChange={this.toChange}
          >
            {this.state.devices.map(item => <Option key={item}>{item}</Option>)}
          </Select>
            <p></p>
            <Input
                onChange={this.valueChange}
                style={{ width: 'calc(20%)' }}
                addonBefore="金额"/>
            <p></p>
            <Button type="primary" onClick={this.sendTransaction}>转账</Button>
          </TabPane>
          <TabPane tab="创建账号" key="2">
            <Input
                onChange={this.inputChange}
                style={{ width: 'calc(20%)' }}
                addonBefore="密码"/>
            <Button type="primary" onClick={this.createAccount}>创建账号</Button>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default LookupDevice;
