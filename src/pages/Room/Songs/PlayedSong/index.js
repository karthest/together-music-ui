import React, { Component } from 'react';
import {Avatar, Col, Row,Slider,Progress } from "antd";



const avatarSize = {
    xs: 141,
    sm: 141,
    md: 141,
    lg: 141,
    xl: 141,
    xxl: 141,
}

class PlayedSong extends Component {
    render() {
        let {music} = this.props.player;
        let {lyric,time,progress} = this.props.player;
        return (
            <div style={{display:'flex',flexDirection:'row'}}>
                <div style={{display:'flex',flex:"1 1 30vw",padding:"0 10px 0 30px"}}>
                    <Avatar src={music.pictureUrl} size={avatarSize}/>
                </div>
                <div style={{display:'flex',flex:"1 1 70vw",flexDirection:"column"}}>
                    <Row>
                        <Col span={12}><h2>{music?music.name:"等一会哦"}</h2></Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            专辑：&nbsp;{music.album?`《${music.album.name}》`:"等一会哦"}&nbsp;
                            歌手：&nbsp;{music?music.artist:"等一会哦"}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}><span>{lyric}</span></Col>
                        <Col span={12}><small>{time}</small></Col>
                    </Row>
                    <Progress percent={progress} showInfo={false}/>
                    <Slider/>
                </div>
            </div>
        );
    }
}

export default PlayedSong;
