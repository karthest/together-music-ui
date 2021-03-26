import React, { Component } from 'react';
import { Table } from "antd";

const {Column} = Table;

class WaitingSong extends Component {
    render() {
        let pick = this.props.pick;
        return (
            <div style={{display:'flex',flex:'1',flexDirection:'column',padding:'10px 0 10px 0',overflow:"auto"}}>
                <Table dataSource={pick} rowKey="id" pagination={false}>
                    <Column title="歌曲" dataIndex="name" key="songName" align="center"/>
                    <Column title="歌手" dataIndex="artist" key="singer" align="center"/>
                    <Column title="专辑" dataIndex={["album","name"]} key="album" align="center"/>
                    <Column title="点歌人" dataIndex="nickName" key="chooser" align="center"/>
                </Table>
            </div>
        );
    }
}

export default WaitingSong;
