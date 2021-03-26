import React, { Component } from 'react';
import header from "./MyHeader.module.css"

class MyHeader extends Component {
    render() {
        return (
            <div className={header.header}>
                <h1>一起听歌吧</h1>
            </div>
        );
    }
}

export default MyHeader;
