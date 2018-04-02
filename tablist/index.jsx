import './index.scss';
import React, { Component } from 'react';
import fetchApi from '../../utils/fetch';
import { groupBy } from 'lodash';
import { Link } from 'react-router';
import Listloading from '../listloading';
import ScrollList from '../scrollList';

class TabList extends Component {

    state = {
        activeTab: '0',
        page: 1,
        done: false,
        listSet: {
            0: {
                page: 1,
                list: []
            }
        }
    };

    ajLock = false;
    lockmap = {}

    componentDidMount() {

        const {activeTab, page} = this.state
        this.handlers('fetchData')('init')({
            show_type: activeTab,
            page: page
        });
    }

    renderTab() {
        const {activeTab, listSet} = this.state;

        return (
            <div className="tabs-box">
                <div className="tabs">
                    {
                        this.getData('tabs')().map((tab, index) => {
                            // this.props.tabTemplate(tab, activeTab)

                            return <this.props.tabTemplate
                                tab={tab}
                                key={index}
                                activeTab={activeTab}
                                onClick={e => this.handlers('changeTab')(tab.key)}
                                />
                        })
                    }
                </div>
            </div>
        )
    }

    renderStatus() {
        const {activeTab, listSet} = this.state;
        const list = this.getData('data')(activeTab)

        return (
            list.length == 0 && listSet[activeTab].done ?
                <div className="empty">
                    <div className="empty_icon"></div>
                    <div className="empty_text">暂无交易数据</div>
                </div>
                :
                <Listloading done={listSet[activeTab].done} />
        )
    }
    render() {
        if (!this.state.initData) return null;

        const {router, className} = this.props;
        const {activeTab, listSet} = this.state;
        const list = this.getData('data')(activeTab)
        
        return (
            <div className={className} >
                    <div className="tab-wrapper">
                        {
                            this.renderTab()
                        }
                    </div>
                   
                
                    <ScrollList className="datas"
                        listData={list}
                        done={listSet[activeTab].done}
                        ListItemTemplate={this.props.ListItemTemplate}
                        // fetchUrl={this.props.fetchUrl}
                        // model={this.props.model}
                        scrollPage={()=>{
                            this.handlers('fetchData')('init')({
                                show_type: activeTab,
                                page: listSet[activeTab].page
                            }, data => {
                                this.handlers('setData')(data, activeTab);
                            })
                        }}
                        dragDown={()=>{
                            this.handlers('fetchData')('init')({
                                show_type: activeTab,
                                page: 1
                            }, data => {
                                this.handlers('setData')(data, activeTab, 1);
                            }, true)
                        }}                    
                    />   

            </div>
        )
    }


    getData(type, props = this.props) {
        const {alert, model=d=>d} = props;
        const {listSet = {}, initData = {}, activeTab} = this.state;
        const {typeList = []} = initData;
        return {
            'tabs': () => [...typeList],
            'data': () => {
                return model(listSet[activeTab].list)
            }
        }[type]
    }

    handlers(type, props = this.props) {
        const {router, setState} = props;
        return {
            'fetchData': (api) => {
                return {
                    'init': (params = {
                        page: this.state.page,
                        show_type: this.state.activeTab
                    }, cb = this.handlers('setData'), enforce) => {

                        let k = `${params.show_type}${params.page}`;

                        if(enforce){
                            for(let i in this.lockmap){
                                if(i.match(new RegExp(`^${params.show_type}`))){
                                    this.lockmap[i] = false
                                }
                            }
                        }

                        if (this.lockmap[k]) return; 
                        this.lockmap[k] = true;
                    


                        fetchApi(props.fetchUrl, params, cb, res => {
                            this.lockmap[k] = false

                            this.props.toast({
                                icon: 'info',
                                text: `${res.msg}`
                            })
                        })
                    }
                }[api]
            },
            'setData': (res, activeTab = this.state.activeTab, page) => {
                let {listSet} = this.state

                if (res.data.list.length > 0) {
                    if(page == 1){
                        listSet[activeTab].list = res.data.list
                        listSet[activeTab].page = 2
                        listSet[activeTab].done = false
                    }else{
                        listSet[activeTab].list = listSet[activeTab].list.concat(res.data.list)
                        listSet[activeTab].page += 1
                    }

                }

                if (res.data.list.length < 10) {
                    listSet[activeTab].done = true
                }

                this.setState({
                    listSet: listSet,
                    initData: res.data
                })
                this.ajLock = false
            },
            'changeTab': activeTab => {
                if (activeTab == this.state.activeTab) return // click same tab
                let {listSet} = this.state;

                if (!listSet[activeTab]) {
                    listSet[activeTab] = {
                        list: [],
                        page: 1
                    }
                }

                this.setState({
                    listSet: listSet,
                    activeTab
                }, () => {
                    if (listSet[activeTab].list.length == 0 && !listSet[activeTab].done) {
                        this.handlers('fetchData')('init')({
                            show_type: activeTab,
                            page: listSet[activeTab].page
                        }, data => {
                            this.handlers('setData')(data, activeTab);
                        })
                    }

                })
            }
        }[type]
    }
}

export default TabList;

