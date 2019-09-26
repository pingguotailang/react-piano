import React from "react";
import './keyless.less';
class PianoKey extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentClassName: "key-up",
        }
    }
    keyDown = () => {
        this.playMusic();
        this.setState({ currentClassName: 'key-down' });
    }
    keyUp = () => {
        this.setState({ currentClassName: 'key-up' });
        this.props.onKeyPlayEnd && this.props.onKeyPlayEnd();
    }
    playMusic() {
        //本地播放模式
        if (window.location.host === "") {
            let audio = new Audio();
            // 设置好音频路径 
            audio.src = "audio/" + this.props.voice + ".mp3";
            // 播放音频 
            audio.play();
        //在线播放模式
        } else {
            let audio = this.props.audio();
            // 播放音频 
            var bufferSource = audio.context.createBufferSource();
            bufferSource.buffer = audio.buffer;
            bufferSource.connect(audio.context.destination);
            bufferSource.loop = false;
            bufferSource.start();
        }
    }
    render() {
        return (
            <button
                className={this.state.currentClassName}
                onMouseDown={this.keyDown.bind(this)}
                onMouseUp={this.keyUp.bind(this)}
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