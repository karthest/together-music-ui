import React, { Component } from 'react';
import { Table,Input, Button} from "antd";
import {timeUtils} from "../../../netConnection/analysis"

class SearchSong extends Component {
    render() {
        let {search,doSearch,updateSearchKeyword,pickMusic} = this.props;
        const columns = [
            {
                title:"歌曲",
                dataIndex:"name",
                key:"name",     
                render:(text,record)=>{
                    return (
                        <div>
                            {text}
                            <Button type="primary" children="点歌" onClick={()=>pickMusic(record)}/>
                        </div>
                    )
                }
            },
            {
                title:"歌手",
                dataIndex:"artist",
                key:"artist",
            },
            {
                title:"专辑",
                dataIndex:["album","name"],
                key:"album",
            },
            {
                title:"时长",
                dataIndex:"duration",
                key:"duration",
                render:duration=>timeUtils.secondsToHH_mm_ss(duration/1000),
        
            }
        ]
        return (
            <div>
                <div>
                    <Input placeholder="输入要搜索的歌曲" onPressEnter={()=>doSearch()} onChange={(e)=>updateSearchKeyword(e)}/>
                </div>
                <Table dataSource={search.data} columns={columns} rowKey="id"/>

            </div>
        );
    }
}
export default SearchSong;
