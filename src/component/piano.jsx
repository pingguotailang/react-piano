import React from "react";
import PianoKey from "./piano-key.jsx";
import { keys } from './key-config';
import music from '../music-score.js';
import { Slider, Switch } from 'antd';
import 'antd/lib/slider/style';
import 'antd/lib/switch/style';
class Piano extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRecord: false,
            records: music,
            isPlaying: false,
            timbre: 'piano'
        }
        // 当键盘点击时，调用音乐响应函数 
        window.onkeydown = this.onPlayKeyDown.bind(this);
        window.onkeyup = this.onPlayKeyUp.bind(this);
        this.recordIndex = 1;
        this.selectIndex = 0;
        this.speed = 1;
        this.audios = {};
        this.stepTimer = 0;
        if (window.location.host !== '') {
            this.initAudios();
        }
    }
    //初始化加载音频
    initAudios() {
        this.audios = [];
        let that = this;
        keys.forEach((item) => {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            let audio = { context: new window.AudioContext() };
            let audioURL = "audio/" + this.state.timbre + '/' + item.voice + ".mp3";
            let xhr = new XMLHttpRequest();
            xhr.open('GET', audioURL, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = (e) => {
                audio.context.decodeAudioData(e.target.response, (buffer) => {
                    audio.buffer = buffer;
                    that.audios[item.voice] = audio;
                })
            }
            xhr.send();
        })
    }
    //调节速度
    onSliderChange(value) {
        this.speed = value;
    }
    //录音
    recordOption() {
        //设置录音状态
        let isRecord = !this.state.isRecord;
        this.setState({ isRecord: !this.state.isRecord });
        if (isRecord) { //开始录音
            //初始化录音
            this['music' + this.recordIndex] = [];
            let p = [undefined, 0];
            this.recordStartTime = new Date().getTime();
            this['music' + this.recordIndex].push(p);
        } else { //结束录音
            let _records = Array.from(this.state.records);
            let currentRecord = this['music' + this.recordIndex];
            let len = currentRecord.length;
            //创建一个新的空录音对象
            let newRecord = {
                name: 'music ' + this.recordIndex,
                miniTime: 1,
                keys: []
            };
            //转换成可识别的数据
            currentRecord.forEach((item, index) => {
                if (index < len - 1) {
                    newRecord.keys.push([item[0], currentRecord[index + 1][1] - item[1]]);
                } else if (index === len - 1) {
                    newRecord.keys.push([item[0], 0]);
                }
            })
            //装入录音列表
            _records.push(newRecord);
            this.setState({ records: _records });
            this.recordIndex++;
        }
    }
    /**
     * 顺序播放音符
     * @param {*} record 音符集
     * @param {*} i 序号
     */
    playStep(record, i) {
        let item = record.keys[i];
        let that = this;
        clearTimeout(that.stepTimer);
        if (item) {
            //求出一个音符播放时延
            let miniTime = (record.miniTime ? record.miniTime : 1) / this.speed;
            let delay = item[1] * miniTime;
            //播放一个音符，并自动弹起琴键
            that.playPianoKey(item[0], true, delay / 3);
            //播放下一个音符
            that.stepTimer = setTimeout(() => {
                clearTimeout(that.stepTimer);
                that.playStep(record, ++i);
            }, delay)
        } else {
            //播放完毕后，自动停止
            this.setState({ isPlaying: false });
        }
    }
    //播放音乐
    playAuto() {
        let _isPlaying = !this.state.isPlaying;
        this.setState({ isPlaying: _isPlaying });
        //播放当前列表选中音乐
        if (_isPlaying) {
            let record = this.state.records[this.selectIndex];
            this.playStep(record, 0);
        } else {
            //停止播放
            clearTimeout(this.stepTimer);
        }
    }
    //播放列表选择切换
    onMusicListChange(e) {
        this.selectIndex = e.target.selectedIndex;
    }
    //通过键盘code找到对应键盘配置
    keyCodeToVoice(keyCode) {
        try {
            let _item = keys.find((item) =>
                item.keyCode === keyCode
            )
            return _item.voice;
        } catch (error) {
            return null;
        }
    }
    //键盘按下，播放声音
    onPlayKeyDown(e) {
        this.playPianoKey(this.keyCodeToVoice(e.keyCode), true);
    }
    //键盘抬起，结束播放效果
    onPlayKeyUp(e) {
        this.playPianoKey(this.keyCodeToVoice(e.keyCode), false);
    }
    /**
     * 键盘播放声音
     * @param {string} v voice值
     * @param {boolean} b 键盘按下or抬起
     * @param {boolean} autoKeyUp 是否自动抬起
     */
    playPianoKey(v, b, autoKeyUp = NaN) {
        if (!v) return;
        //键盘按下
        if (b) {
            if (!this['key' + v]) {
                this["btn" + v].keyDown();
                this['key' + v] = true;
            }
            if (autoKeyUp) {
                let that = this;
                let temp = setTimeout(() => {
                    that["btn" + v].keyUp();
                    that['key' + v] = false;
                    clearTimeout(temp);
                }, autoKeyUp)
            }
        //键盘抬起
        } else {
            this["btn" + v].keyUp();
            this['key' + v] = false;
        }
    }
    //键盘按键抬起后回调
    onKeyPlayEnd(value) {
        //录制
        this.recordOne(value.voice);
    }
    //将一次键盘点击事件录制到录音记录中
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
                <span dangerouslySetInnerHTML={{ __html: "播放列表".big() + `<sup>♥</sup>` }}></span>
                <select
                    style={{ minWidth: 100 }}
                    id="AreaId" name="AreaId"
                    size="1"
                    onChange={this.onMusicListChange.bind(this)}>
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
                        keys.map(
                            (value, index) => <PianoKey
                                ref={node => this['btn' + value.voice] = node}
                                onKeyPlayEnd={this.onKeyPlayEnd.bind(this, value)}
                                key={index + 'key'}
                                audio={() => this.audios[value.voice]}
                                timbre={this.state.timbre}
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