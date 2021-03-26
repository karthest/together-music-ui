import React, { Component } from 'react';
import { Row,Col,Button, Input} from "antd";
import { UserOutlined,ClearOutlined} from "@ant-design/icons";

import chatBox from "./ChatBox.module.css";
// import { Link } from 'react-router-dom';

class Chat extends Component {

    chatBox = React.createRef();
    clearChat = ()=>{
        this.chatBox.current.innerHTML = "";
    }
    musicSkipVote = ()=>{
        let stompClient = this.props.socket.stompClient;
        stompClient.send(
            "/music/skip/vote",
            {},
            {},
        )
    }
    render() {
        let {socket,chatData} = this.props;
        return (
            <div style={{display:"flex",flex:"1 1 25vw",flexDirection:"column"}}>
                <Row>
                    <Col span={4}>
                        <Button>
                            <UserOutlined/>
                            {socket.online}
                        </Button>
                    </Col>
                    <Col span={4} offset={16}>
                        <Button onClick={()=>this.clearChat()}>
                            <ClearOutlined/>                            
                        </Button>
                    </Col>
                </Row>
                <div style={{display:'flex',flexDirection:"column",flex:"1 1 auto"}}>
                    <div ref={this.chatBox} style={{display:'flex',backgroundColor:"transparent",flexDirection:"column",overflow:"auto",flex:"1 1 50vh"}}>
                        {
                            chatData.map((chatItem,index)=>{
                                if(chatItem.type === "notice"){
                                    return (
                                        <div style={{textAlign:"center",padding:'10px 0'}} key={index}>
                                            <span className={chatBox.chatdatanotice}>{chatItem.content}</span>
                                        </div>
                                    )
                                } 
                                else{
                                    return (
                                        <div style={{padding:"10px 0"}} key={index}>
                                            <div>
                                                <small>
                                                    {chatItem.nickName}
                                                </small>
                                            </div>
                                            <div className={chatBox.chatdatacontent}>
                                                {chatItem.content}
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                    <Input placeholder="回车发送消息" onChange={(e)=>this.props.updateChatMessage(e)} onPressEnter={this.props.sendHandler}/>
                    {/* <Link to={{path:"/search",state:{socket:socket,search:search,doSearch:doSearch,updateSearchKeyword:updateSearchKeyword,pickMusic:pickMusic}}}> */}
                        <Button>点歌</Button>
                    {/* </Link> */}
                    <Button onClick={()=>this.musicSkipVote()}>切歌</Button>
                </div>
            </div>
        )
    }
}

export default Chat;
