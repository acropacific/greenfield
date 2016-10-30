import styles from 'style';
import React from 'react';
import $ from 'jquery';
import PlaylistItem from 'PlaylistItem';
import audioPlayer from '../player/AudioPlayer2';
import visualizer from '../visualizer/visualizer';

let myDebug = require('debug');
myDebug.enable('Player:*');
const log = myDebug('Player:log');
const info = myDebug('Player:info');
const error = myDebug('Player:error');

class Player extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      playId: null,
      playBtn: '▶',
      className: 'round-button-play',
      status: 'IDLE',
      playlist: [],
      currentTrack: { username: '', title: '', description: '' },
      node: null,
      ws: props.route.ws
    };
  }

  componentDidMount() {
    let node = document.getElementsByClassName('audioOutput')[0];
    this.setState({ node: node });
    this.init();
    visualizer.initAudio(node);
  }

  init() {
    log('init');

    audioPlayer.init(this.statusUpdate.bind(this), this.state.ws);

    let context = this;
    let query = { 'username': '.*' };
    $.post('/api/recordings', query, data => {
      log('playlist received');
      let index = 0;
      data.map(datum => $.get('/api/recording/' + datum, item => {
        if (!item.status) { // make sure item exists
          let playlist = this.state.playlist;
          playlist[index] = item;
          context.setState({ playlist: playlist });
          if (index === 0) {
            context.setState({ currentTrack: playlist[0] });
          }
          index++;
        }
      }));
    });
  }

  statusUpdate(status) {
    this.setState({ status: status });
    this.updatePlayer();
  }

  updatePlayer() {
    if (this.state.status === 'IDLE') {
      this.setState({ playBtn: '▶', className: 'round-button-play' });
    } else {
      this.setState({ playBtn: '■', className: 'round-button-stop' });
    }
  }

  handleClick(item) {
    log('click', item);

    let start = false;
    if (this.state.status === 'IDLE') {
      start = true;
    } else {
      audioPlayer.stop();
      if (item !== this.state.currentTrack) {
        start = true;
      }
    }
    this.setState({ currentTrack: item });

    let testingLive = false;
    if (testingLive) {
      // to test live streaming
      audioPlayer.start('recorder_user', this.state.node, 'gilles');
    } else {
      $.get('/api/recording/' + item.id, data => {
        if (!data.status) {
          audioPlayer.start(data.url, this.state.node, 'gilles');
        }
      });
    }
  }

  render() {
    return (
      <div className="player">
        <h1>Player</h1>
        <div id="viz">
          <canvas id="analyser" width="1024" height="200"></canvas>
        </div>
        <audio controls autoPlay className="audioOutput"></audio>
        <div className="controls">
          <div className="round-button">
            <div className="round-button-circle">
              <div onClick={ () => this.handleClick(this.state.currentTrack) } className={this.state.className}>{this.state.playBtn}</div>
            </div>
          </div>
          <br></br>
          <button name="stop">Stop</button>
          <br></br>
          <br></br>
          <button name="otherAction">Other Action</button>
          <p>{this.state.status}</p>
        </div>

        <div className="meta">
          <h2>Track Information</h2>
          <div className="trackInfo">
            <p>
              <span><strong>{this.state.currentTrack.username}</strong></span>
              <span>{this.state.currentTrack.title}</span>
              <span>{this.state.currentTrack.description}</span>
            </p>
          </div>
          <h2>Playlist</h2>
          <div className="playlistContainer">
            <table className="playlistTable">
              <tbody>
                {this.state.playlist.map(item =>
                  <PlaylistItem handleClick={this.handleClick.bind(this)} key={item.id} item={item} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Player;
