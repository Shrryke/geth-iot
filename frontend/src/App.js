import { FileOutlined, PieChartOutlined, UserOutlined } from '@ant-design/icons';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Layout, Menu, Icon, Tag, Alert, Spin } from 'antd';
import './App.css';

import Home from './components/Home';
import RegisterDevice from './components/RegisterDevice';
import ManageDevices from './components/ManageDevices';
import LookupDevice from './components/LookupDevice';
import CheckDevice from "./components/CheckDevice";
import Candidates from "./components/Candidates";
import CheckSignatures from "./components/CheckSignatures";
import CheckSignature from "./components/CheckSignature";

import getWeb3j from './utils/web3js'

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      deviceManagerInstance: null,
      errorMessage: '',
      loading: true
    }
  }

  async componentWillMount() {
    getWeb3j.then(results=> {
      this.setState({
        web3: results.web3,
        loading:false,
      });


      //console.log(`Using address: ${this.state.web3.eth.getValidators()}`)
      if (this.state.web3 == null) {
        this.setState({
          loading: false,
          errorMessage: '后台未启动',
        })
      }
    });

    // getWeb3.then(results => {
    //   this.setState({
    //     web3: results.web3,
    //   });
    //
    //   console.log(`Using address: ${this.state.web3.eth.accounts[0]}`);
    //
    //   return DeviceManager.then(instance => {
    //     this.setState({
    //       loading: false,
    //       deviceManagerInstance: instance
    //     });
    //
    //     console.log(`Contract address: ${instance.address}`);
    //   }).catch(error => {
    //     console.log(error);
    //     this.setState({
    //       errorMessage: error.message,
    //       loading: false
    //     });
    //   });
    // }).catch(() => {
    //   let errorMessage = 'Error finding web3. Please install MetaMask.';
    //   console.log(errorMessage);
    //   this.setState({
    //     errorMessage: errorMessage,
    //     loading: false
    //   });
    // });
  }

  mainContent() {
    if (!this.state.loading) {
      let childComponent;
      //if (this.state.web3 == null || this.state.deviceManagerInstance == null) {
      if (this.state.web3 == null) {
        childComponent = <div>
          <h1>Resolve the following issues to continue</h1>
          <Alert
            message="Error"
            description={this.state.errorMessage}
            type="error"
            showIcon
          />
        </div>
      } else {
        childComponent = <div>
          <Route exact path="/" component={Home} />
          {/*<Route path="/edit-entity" component={EditEntity} />*/}
          {/*<Route path="/lookup-entity/:address?" component={LookupEntity} />*/}
          <Route path="/register-device" component={RegisterDevice} />
          <Route path="/manage-devices" component={ManageDevices} />
          {/*<Route path="/manage-device/:deviceId" component={ManageDevice} />*/}
          <Route path="/lookup-device" component={LookupDevice} />
          <Route path="/check-device" component={CheckDevice} />
          <Route path="/check-signatures/:deviceId" component={CheckSignatures} />
          <Route path="/check-signature/:signatureId" component={CheckSignature} />
          {/*<Route path="/sign-device" component={SignDevice} />*/}
          <Route path="/get-candidates" component={Candidates} />
        </div>
      }
      return (
        <div>
          {childComponent}
        </div>
      );
    }
  }
  render() {
    let statusTag;

    if (this.state.web3 == null) {
      statusTag = <Tag color="red">Network error</Tag>;
    } else {
      statusTag = <Tag color="green">OK</Tag>;
    }

    return (
      <Router>
        <Layout style={{ height: "100vh" }}>
          <Header className="header">
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">
                <Link to="/" className="nav-text">IoT Device Management</Link>
              </Menu.Item>
              <Menu.Item key="2" style={{ float: 'right' }}>
                Status: {statusTag}
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '24px 50px' }}>
            <Layout style={{ padding: '24px 0', background: '#fff' }}>
              <Sider width={200} style={{ background: '#fff' }}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={['']}
                  defaultOpenKeys={['sub1', 'sub2', 'sub3']}
                  style={{ height: '100%' }}
                >
                  {/*<SubMenu key="sub1" title={<span><Icon type="user" />Entities</span>}>*/}
                  {/*  <Menu.Item key="1">*/}
                  {/*    <Link to="/edit-entity" className="nav-text">Edit</Link>*/}
                  {/*  </Menu.Item>*/}
                  {/*  <Menu.Item key="2">*/}
                  {/*    <Link to="/lookup-entity" className="nav-text">Lookup</Link>*/}
                  {/*  </Menu.Item>*/}
                  {/*</SubMenu>*/}
                  <SubMenu key="sub2" title={<span><Icon type="laptop" />基本操作</span>}>
                    <Menu.Item key="3">
                      <Link to="/register-device" className="nav-text">注册设备</Link>
                    </Menu.Item>
                    <Menu.Item key="5">
                      <Link to="/lookup-device" className="nav-text">其他操作</Link>
                    </Menu.Item>
                    {/*
                    <Menu.Item key="5">
                      <Link to="#" className="nav-text">Filter</Link>
                    </Menu.Item>
                    */}
                  </SubMenu>

                  <SubMenu key="sub3" title={<span><Icon type="form" />设备列表</span>}>
                    <Menu.Item key="4">
                      <Link to="/manage-devices" className="nav-text">本地设备</Link>
                    </Menu.Item>
                    <Menu.Item key="6">
                      <Link to="/check-device" className="nav-text">当日矿工</Link>
                    </Menu.Item>
                    <Menu.Item key="7">
                      <Link to="/get-candidates" className="nav-text">候选列表</Link>
                    </Menu.Item>
                  </SubMenu>

                </Menu>
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 400 }}>
                <Spin spinning={this.state.loading} className="loading-spin">
                  {this.mainContent()}
                </Spin>
              </Content>
            </Layout>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            IoT Device Management &copy; 2023 Created by Wanglk
        </Footer>
        </Layout>
      </Router>
    );
  }
}

export default App;
