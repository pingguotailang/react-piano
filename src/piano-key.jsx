import React from "react";
import './keyless.less';
class PianoKey extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentClassName : "key-up",
        }
    }
    keyDown = () => {
        this.playMusic();
        this.setState({currentClassName:'key-down'});
    }
    keyUp = () => {
        this.setState({currentClassName:'key-up'});
        this.props.onKeyPlayEnd && this.props.onKeyPlayEnd();
    }
    playMusic() {
        var audio = new Audio();
        // 设置好音频路径 
        audio.src = "audio/" + this.props.voice + ".mp3";
        // 播放音频 
        audio.play();
    }
    render() {
        return (
            <button
                className={this.state.currentClassName}
                onMouseDown={this.keyDown.bind(this)}
                onMouseUp = {this.keyUp.bind(this)}
                style={{
                    background: this.props.color,
                    width: this.props.w,
                    height: this.props.h,
                    left: this.props.x,
                    color: "white"
                }}>
                {this.props.voice}
            </button>
        )
    }
}
export default PianoKey;