import React from "react";
import PianoKey from "./piano-key.jsx";
import {keys} from './key-config';
import music from '../music-score.js';
import { Slider, Switch } from 'antd';
import 'antd/lib/slider/style';
import 'antd/lib/switch/style';
class Piano extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keys: keys,
            isRecord: false,
            records: music,
            isPlaying: false,
        }
        // 当键盘点击时，调用音乐响应函数 
        window.onkeydown = this.onPlayKeyDown.bind(this);
        window.onkeyup = this.onPlayKeyUp.bind(this);
        this.recordIndex = 1;
        this.selectIndex = 0;
        this.speed = 1;
        this.audios = {};
        this.stepTimer = 0;
        if(window.location.host !== ''){
            this.initAudios();
        }
    }
    //初始化加载音频
    initAudios(){
        this.audios = [];
        let that = this;
        keys.map((item)=>{
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            let audio = {context:new window.AudioContext()};
            let audioURL = "audio/" + item.voice + ".mp3";
            let xhr = new XMLHttpRequest();
            xhr.open('GET',audioURL,true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = (e) => {
                audio.context.decodeAudioData(e.target.response,(buffer)=>{
                    audio.buffer = buffer;
                    that.audios[item.voice] = audio;
                })
            }
            xhr.send();
        })
    }
    componentDidMount() {

    }
    onSliderChange(value) {
        this.speed = value;
    }
    recordOption() {
        let isRecord = !this.state.isRecord;
        this.setState({ isRecord: !this.state.isRecord });
        if (isRecord) {
            this['music' + this.recordIndex] = [];
            let p = [undefined, 0];
            this.recordStartTime = new Date().getTime();
            this['music' + this.recordIndex].push(p);
        } else {
            let _records = Array.from(this.state.records);
            let currentRecord = this['music' + this.recordIndex];
            let len = currentRecord.length;
            let newRecord = {
                name: 'music ' + this.recordIndex,
                miniTime: 1,
                keys: []
            };
            currentRecord.map((item, index) => {
                if (index < len - 1) {
                    newRecord.keys.push([item[0], currentRecord[index + 1][1] - item[1]]);
                } else if (index === len - 1) {
                    newRecord.keys.push([item[0], 0]);
                }
            })
            _records.push(newRecord);
            this.setState({ records: _records });
            if (this.recordIndex === 0) {
                this.selectIndex = 0;
            }
            this.recordIndex++;
        }
    }
    playStep(record, i) {
        let item = record.keys[i];
        let that = this;
        clearTimeout(that.stepTimer);
        if (item) {
            let miniTime = (record.miniTime ? record.miniTime : 1) / this.speed;
            let delay = item[1] * miniTime;
            that.playPianoKey(item[0], true, delay / 3);
            that.stepTimer = setTimeout(() => {
                clearTimeout(that.stepTimer);
                that.playStep(record, ++i);
            }, delay)
        } else {
            this.setState({ isPlaying: false });
        }
    }
    playAuto() {
        let _isPlaying = !this.state.isPlaying;
        this.setState({ isPlaying: _isPlaying });
        if (_isPlaying) {
            let record = this.state.records[this.selectIndex];
            this.playStep(record, 0);
        } else {
            clearTimeout(this.stepTimer);
        }
    }
    onRecordChange(e) {
        this.selectIndex = e.target.selectedIndex;
    }
    keyCodeToVoice(keyCode) {
        let _voice;
        this.state.keys.map((item, index) => {
            if (item.keyCode === keyCode) {
                _voice = item.voice;
            };
        })
        return _voice;
    }
    onPlayKeyDown(e) {
        this.playPianoKey(this.keyCodeToVoice(e.keyCode), true);
    }
    onPlayKeyUp(e) {
        this.playPianoKey(this.keyCodeToVoice(e.keyCode), false);
    }
    playPianoKey(n, b, autoKeyUp = NaN) {
        if (!n) return;
        if (b) {
            if (!this['key' + n]) {
                this["btn" + n].keyDown();
                this['key' + n] = true;
            }
            if (autoKeyUp) {
                let that = this;
                let temp = setTimeout(() => {
                    that["btn" + n].keyUp();
                    that['key' + n] = false;
                    clearTimeout(temp);
                }, autoKeyUp)
            }
        } else {
            this["btn" + n].keyUp();
            this['key' + n] = false;
        }
    }
    onKeyPlayEnd(value) {
        this.recordOne(value.voice);
    }
    recordOne(voice) {
        if (this.state.isRecord) {
            let time = new Date().getTime() - this.recordStartTime;
            let p = [voice, time];
            this['music' + this.recordIndex].push(p);
        }
    }
    
    render() {
        return (
            <div>
                <button style={{ width: 100 }} onClick={this.recordOption.bind(this)}>{this.state.isRecord ? 'stop record' : 'record'}</button>
                <button style={{ width: 100 }} onClick={this.playAuto.bind(this)}>{this.state.isPlaying ? 'stop playing' : 'play'}</button>
                <span dangerouslySetInnerHTML={{__html:"播放列表".big()+`<sup>♥</sup>`}}></span>
                <select
                    style={{ minWidth: 100 }}
                    id="AreaId" name="AreaId"
                    size="1"
                    onChange={this.onRecordChange.bind(this)}>
                    {
                        this.state.records.map((item, index) =>
                            <option
                                key={'option' + index}
                                value={item}>
                                {item.name}
                            </option>)
                    }
                </select>
                <Slider defaultValue={1} max={1.5} min={0.5} onChange={this.onSliderChange.bind(this)} step={0.01} />
                <div style={{ display: "flex" }}>
                    {
                        this.state.keys.map(
                            (value, index) => <PianoKey
                                ref={node => this['btn' + value.voice] = node}
                                onKeyPlayEnd={this.onKeyPlayEnd.bind(this, value)}
                                key={index + 'key'}
                                audio={() => this.audios[value.voice]}
                                {...value}
                                index={index} />
                        )
                    }
                </div>
            </div>
        )
    }
}
export default Piano;