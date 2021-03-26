import React, { Component } from 'react';

import Chat from "./Chat";
import Songs from "./Songs";
import  room from "./Room.module.css";
import axios from "axios";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { message } from "antd";
import SearchSong from "./SearchSong";
import {sendUtils,messageUtils,timeUtils,musicUtils} from "../../netConnection/analysis";
import { Route } from 'react-router';

const baseUrl = "http://159.75.112.74:8888"
const houseInfo = {
    id:"DEFAULT",
    password:""
}

class Room extends Component {
    music1 = React.createRef();
    music2 = React.createRef(); 
    state = {
        socket:{
            socketClient: {},
            stompClient: {},
            stompHeaders: {},
            online: 0,
            isConnected: false,
            userName: localStorage.getItem("USER_NAME") ? localStorage.getItem("USER_NAME") : null,
            isRoot: false,
            isAdmin: false,
			good:false
        },
        chat: {
            data: [],
            message: ''
        },
        search: {
            keyword: '',
            count: 0,
            data: [],
            picture: {
                keyword: '',
                count: 0,
                data: [],
            }
        },
        player: {
            pick: [],
            music: {},
            lyrics: [],
            lyric: '',
            volume: localStorage.getItem('VOLUME') ? Number(localStorage.getItem('VOLUME')) : 10,
            progress: 0,
            time: '00:00 / 00:00',
			music2:{}
        },
        currentLyric: "",
        lastLyric:"",
        firstLoaded:0,
        secondUrl:"",
        playingId:"",
        source:"qq",
        limit:10,
        current:1,
    }
    enterhouse = ()=>{
        axios.post(`${baseUrl}/house/enter`,houseInfo).then(
            (response)=>{console.log(`response`, response);},
            (failure)=>{console.log(`failure`, failure);}
        )
    }
    setName = (name)=>{
        let stompClient = this.state.socket.stompClient;
        stompClient.send(
            "/setting/name",
            {},
            JSON.stringify({
                name:name,
                sendTime:Date.now()
            })
        );
    }
    subscribe = ()=>{
        let stompClient = this.state.socket.stompClient;
        // console.log(`stompClient`, stompClient);
        stompClient.subscribe("/topic/chat",{},(response)=>{
            let body = JSON.parse(response.body);
            if(body.code ==="20000"){
                message.info(`系统通知：${body.data}`,0);
            }
        });

        stompClient.subscribe("/topic/music/order",(response)=>{
            // console.log('来自 /topic/music/order 频道的消息', response);
        });
        this.saveSocket(null,stompClient);
    }
    saveSocket = (socketClient,stompClient)=>{
        if(socketClient != null){
            this.setState((state)=>{
                return {
                    socket:{
                        ...state.socket,
                        socketClient:socketClient,
                    }
                }
            })
        }
        if(stompClient != null){
            this.setState((state)=>{
                return {
                    socket:{
                        ...state.socket,
                        stompClient:stompClient,
                    }
                }
            })
        }
    }
    connect = ()=>{
        let socketClient;
        let stompClient;
        socketClient = new SockJS(`${baseUrl}/server?houseId=${houseInfo.id}&housePwd=${houseInfo.password}&connectType=enter`);
        stompClient = Stomp.over(socketClient);
        stompClient.connect(
            {},
            (frame)=>{
                this.setState({
                    socket:{
                        ...this.state.socket,
                        isConnected:true
                    }
                })
                let afterOnMessage = socketClient.onmessage;
                socketClient.onmessage = (message)=> {
                    this.messageHandler(message);
                    afterOnMessage(message);
                }
                let afterOnclose = socketClient.onclose;
                socketClient.onclose = (e)=> {
                    if(e.type === "close"){
                        this.setState({
                            socket:{
                                ...this.state.socket,
                                isConnected:false
                        }});
                        this.setState({
                            chat:{
                                ...this.state.chat,
                                data:[
                                    ...this.state.chat.data,
                                    {
                                        type:"notice",
                                        content:"网络异常，请尝试重新连接服务器",
                                    }
                                ]
                        }})
                        message.error("网络异常，请重新连接");
                        setTimeout(() => {
                            if(!this.state.socket.isConnected){
                                this.connect();
                            }
                        }, 444);
                    }
                    afterOnclose(e);
                };
                let userName = window.localStorage.getItem("USER_NAME");
                if(userName){
                    this.setName(userName);
                }
                this.saveSocket(socketClient,stompClient);
                this.subscribe();
            },
            (error)=>{
                console.log(`连接到服务器失败`,error);
            }
        )
    }
    musicTimeUpdate = (e)=>{
        let currentTime = e.target.currentTime;
        let duration = e.target.duration;

        let usedTimeHH_mm_ss = timeUtils.secondsToHH_mm_ss(currentTime);
        let durationHH_mm_ss = timeUtils.secondsToHH_mm_ss(duration);
        let time = usedTimeHH_mm_ss + " / " + durationHH_mm_ss;
        
        this.setState({
            player:{
                ...this.state.player,
                progress:(currentTime / duration) * 100,
                time:time,
            }
        })
        let lyrics = this.state.player.lyrics;
        if(lyrics.length === 0){
            this.setState({
                player:{
                    ...this.state.player,
                    lyric:"暂无歌词",
                }
            })
        }
        else{
            let number = Number(currentTime.toFixed());
            if(
                lyrics[number] !== undefined &&
                lyrics[number] !== "" &&
                lyrics[number] !== this.currentLyric
            ){
                this.setState({
                    currentLyric:lyrics[number],
                    lastLyric:this.state.currentLyric,
                    player:{
                        ...this.state.player,
                        lyric:lyrics[number],
                    }
                })
            }
        }
    }
    messageHandler = (source)=>{
        if(messageUtils.isKnowMessageType(source.data)){
            let messageType = messageUtils.parseMessageType(source.data);
            let messageContent = messageUtils.parseMessageContent(source.data);
            let chat_data_temp = this.state.chat.data.slice(0);
            switch(messageType){
                case messageUtils.messageType.ONLINE:{
                    if(
                        messageContent.data.count !== undefined &&
                        typeof messageContent.data.count !== "undefined" &&
                        messageContent.data.count !== null &&
                        messageContent.data.count !== ""
                    ){
                        this.setState({
                            socket:{
                                ...this.state.socket,
                                online:messageContent.data.count,
                            }
                        })
                    }
                    break;
                }
                case messageUtils.messageType.HOUSE_USER:{
                    
                    let users = messageContent.data;
                    for(let i = 0;i < users.length;i++){
                        chat_data_temp.push({
                            content:`${i}1.${users[i].nickName}[${users[i].sessionId}]`,
                            type:"notice",
                        })
                    };
                    this.setState({
                        chat:{
                            ...this.state.chat,
                            data:chat_data_temp,
                        }
                    })
                    break;
                }
                case messageUtils.messageType.PICK:{
                    this.setState({
                        player:{
                            ...this.state.player,
                            pick:messageContent.data,
                        }
                    })
                    if (messageContent.data.length > 1) {
                        this.setState({
                            secondUrl:messageContent.data[1].ur,
                        })
                        if (this.firstLoaded === 1) {
                            this.setState({
                                player:{
                                    ...this.state.player,
                                    music2:{
                                        ...this.state.player.music2,
                                        url:this.state.secondUrl,
                                    }
                                }
                            })
                        }
                    }
                    break;
                }
                case messageUtils.messageType.MUSIC:{
                    this.setState({
                        lastLyric:"",
                        firstLoaded:0,
                        player:{
                            ...this.state.player,
                            lyric:"",
                            music:messageContent.data,
                        }
                    });
                    if(this.music1.current) this.music1.current.preload = "auto";
                    if(
                        messageContent.data.lyric === undefined ||
                        typeof messageContent.data.lyric === "undefined" ||
                        messageContent.data.lyric === null ||
                        messageContent.data.lyric === ""
                    ){
                        this.setState({
                            player:{
                                ...this.state.player,
                                lyrics:[],
                            }
                        })
                    }
                    else{
                        // console.log(messageContent.data.lyric);
                        this.setState({
                            player:{
                                ...this.state.player,
                                lyrics:musicUtils.parseLyric(messageContent.data.lyric),
                            }
                        })
                    }
                    break;
                }
                case messageUtils.messageType.NOTICE:{
                    if(
                        messageContent.message !== undefined &&
                        typeof messageContent.message !== "undefined" &&
                        messageContent.message !== null &&
                        messageContent.message !== ""
                    ){
                        chat_data_temp.push({
                            content:messageContent.message,
                            type:"notice",
                        })
                        this.setState(
                            {
                                chat:{
                                    ...this.state.chat,
                                    data:chat_data_temp,
                                }
                            }
                        );
                        if(messageContent.message === "点歌成功"){
                            message.info(`${messageContent.message}`)
                        }
                    }
                    else{
                        message.info(`${messageContent.message}`)
                    }
                    break;
                }
                case messageUtils.messageType.CHAT:{
                    let imgList = [];
                    let matchUrlList = messageContent.data.content.match(
                    /[picture].*?:\/\/[^\s]*/gi
                    );
                    if (matchUrlList !== null) {
                        for (let i = 0; i < matchUrlList.length; i++) {
                            imgList.push(matchUrlList[i].replace("picture:", ""));
                            messageContent.data.content = messageContent.data.content.replace(matchUrlList[i],"");
                        }
                    }
                    messageContent.data.images = imgList;
                    chat_data_temp.push(messageContent.data);
                    this.setState({
                        chat:{
                            ...this.state.chat,
                            data:chat_data_temp,
                        }
                    })
                    break;
                }
                case messageUtils.messageType.SEARCH:{
                    this.setState({
                        search:{
                            ...this.state.search,
                            count:messageContent.data.totalSize,
                            data:messageContent.data.data,
                        }
                    });
                    break;
                }
                default:{
                    console.log(`未知消息类型`);
                    break;
                }
            }
        }
    }
    sendHandler = ()=>{
        let stompClient = this.state.socket.stompClient;
        let chatMessage = this.state.chat.message;
        let instruction = sendUtils.parseInstruction(chatMessage);
        switch (instruction){
            default:{
                if(chatMessage === null || chatMessage==="" || chatMessage.length===0){
                    message.warning("请输入消息");
                    return ;
                }
                else{
                    stompClient.send(
                        "/chat",
                        {},
                        JSON.stringify({
                            content:chatMessage,
                            sendTime:Date.now(),
                        })
                    )
                }
            }
        }
    }
    nextsong = (e)=>{
        this.setState({
            firstLoaded:1,
            player:{
                ...this.state.player,
                music2:{
                    ...this.state.player.music2,
                    url:this.secondUrl,
                }
            }
        })
    }
    setCurrentTime = ()=>{
        let {id,source,pushTime} = this.state.player.music;
        this.setState({
            playingId:id+source+pushTime,
        })
    }
    doSearch = ()=>{
        let stompClient = this.state.socket.stompClient;
        if(stompClient.send !== undefined)
            stompClient.send(
                "/music/search",
                {},
                JSON.stringify({
                    name:this.state.search.keyword.trim(),
                    sendTime:Date.now(),
                    source:this.state.source,
                    pageIndex:this.state.current,
                    pageSize:this.state.limit,
                })
            )
    }
    updateSearchKeyword = (e)=>{
        this.setState({
            search:{
                ...this.state.search,
                keyword:e.target.value,
            }
        })
    }
    updateChatMessage  =(e)=>{
        this.setState({
            chat:{
                ...this.state.chat,
                message:e.target.value,
            }
        })
    }
    componentDidMount(){
        this.connect();
    }
    pickMusic = (music)=>{
        let stompClient = this.state.socket.stompClient;
        stompClient.send(
            "/music/pick",
            {},
            JSON.stringify({
                name:music.name,
                id:music.id,
                source:this.state.source,
                sendTime:Date.now(),
            }),
        )
        message.info(`已发送点歌请求${music.name}`);
    }
    render() {
        let {music,music2} = this.state.player;
        return (
            <div>
                {/* <Route path="/search" component={SearchSong}/> */}
                <SearchSong socket={this.state.socket} search={this.state.search} doSearch={this.doSearch} updateSearchKeyword={this.updateSearchKeyword} pickMusic={this.pickMusic}/>
                <div className={room.room}>
                    <Songs player={this.state.player}/>
                    <audio ref={this.music1} src={music.url} onTimeUpdate={this.musicTimeUpdate} autoPlay="autoplay" onCanPlayThrough={this.nextsong} onCanPlay={this.setCurrentTime}/>
                    <audio ref={this.music2} src={music2.url}/>
                    <Chat chatData={this.state.chat.data} socket={this.state.socket} updateChatMessage={this.updateChatMessage} sendHandler={this.sendHandler}/>
                    <div className={room.background}>
                        <img src={this.state.player.music.pictureUrl?this.state.player.music.pictureUrl:""} alt=""/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Room;
