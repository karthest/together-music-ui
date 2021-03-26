import React, { Component } from 'react';

import PlayedSong from "./PlayedSong";
import WaitingSongs from "./WaitingSongs";
import { PropTypes } from "prop-types";

import song from "./Songs.module.css"
class Songs extends Component {
    render() {
        let {pick} = this.props.player;
        return (
            <div className={song.song}>
                <PlayedSong player={this.props.player}/>
                <WaitingSongs pick={pick}/>
            </div>
        );
    }
}
Songs.protoTypes = {
    player:PropTypes.object,
}

export default Songs;
