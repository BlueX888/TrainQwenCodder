const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号记录
window.__signals__ = {
  recordingStarted: false,
  recordingEnded: false,
  playbackStarted: false,
  playbackEnded: false,
  recordedActions: [],
  playbackActions: [],
  playbackSpeed: 1.0
};

let player;
let recordingPlayer; // 录制时的玩家位置记录
let playbackGhost; // 回放时的幽灵玩家
let cursors;
let spaceKey;
let speedKeys;

let recordingStartTime = 0;
let isRecording = false;
let recordedActions = [];
const RECORDING_DURATION = 2000; // 2秒

let isPlayback = false;
let playbackStartTime = 0;
let playbackSpeed = 1.0;
let currentActionIndex = 0;

let statusText;
let speedText;
let instructionText;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建幽灵玩家纹理（半透明）
  const ghostGraphics = this.add.graphics();
  ghostGraphics.fillStyle(0xff00ff, 0.6);
  ghostGraphics.fillCircle(16, 16, 16);
  ghostGraphics.generateTexture('ghost', 32, 32);
  ghostGraphics.destroy();

  // 创建玩家
  player = this.add.sprite(400, 300, 'player');
  player.setData('vx', 0);
  player.setData('vy', 0);

  // 创建回放幽灵（初始隐藏）
  playbackGhost = this.add.sprite(400, 300, 'ghost');
  playbackGhost.setVisible(false);

  // 输入设置
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 速度控制键
  speedKeys = {
    one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
  };

  // UI文本
  statusText = this.add.text(10, 10, 'Status: Idle', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  speedText = this.add.text(10, 40, 'Playback Speed: 1.0x', {
    fontSize: '16px',
    fill: '#ffff00'
  });

  instructionText = this.add.text(10, 70, 
    'Arrow Keys: Move | SPACE: Start Playback\n1: 0.5x | 2: 1.0x | 3: 2.0x', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  // 开始录制
  startRecording.call(this);

  // 空格键监听
  spaceKey.on('down', () => {
    if (!isRecording && !isPlayback && recordedActions.length > 0) {
      startPlayback.call(this);
    }
  });

  // 速度控制监听
  speedKeys.one.on('down', () => { playbackSpeed = 0.5; updateSpeedText(); });
  speedKeys.two.on('down', () => { playbackSpeed = 1.0; updateSpeedText(); });
  speedKeys.three.on('down', () => { playbackSpeed = 2.0; updateSpeedText(); });
}

function startRecording() {
  isRecording = true;
  recordingStartTime = Date.now();
  recordedActions = [];
  recordingPlayer = { x: player.x, y: player.y };
  
  statusText.setText('Status: Recording (2s)');
  statusText.setColor('#ff0000');
  
  window.__signals__.recordingStarted = true;
  window.__signals__.recordedActions = [];
  
  console.log('[SIGNAL] Recording started at', recordingStartTime);
}

function stopRecording() {
  isRecording = false;
  statusText.setText('Status: Ready (Press SPACE to playback)');
  statusText.setColor('#00ff00');
  
  window.__signals__.recordingEnded = true;
  window.__signals__.recordedActions = JSON.parse(JSON.stringify(recordedActions));
  
  console.log('[SIGNAL] Recording ended. Total actions:', recordedActions.length);
  console.log('[SIGNAL] Recorded data:', JSON.stringify(recordedActions.slice(0, 5)) + '...');
}

function startPlayback() {
  if (recordedActions.length === 0) return;
  
  isPlayback = true;
  playbackStartTime = Date.now();
  currentActionIndex = 0;
  
  // 重置幽灵位置到录制起点
  playbackGhost.setPosition(recordingPlayer.x, recordingPlayer.y);
  playbackGhost.setVisible(true);
  
  statusText.setText('Status: Playback');
  statusText.setColor('#ff00ff');
  
  window.__signals__.playbackStarted = true;
  window.__signals__.playbackSpeed = playbackSpeed;
  window.__signals__.playbackActions = [];
  
  console.log('[SIGNAL] Playback started at speed', playbackSpeed + 'x');
}

function stopPlayback() {
  isPlayback = false;
  playbackGhost.setVisible(false);
  
  statusText.setText('Status: Ready (Press SPACE to playback)');
  statusText.setColor('#00ff00');
  
  window.__signals__.playbackEnded = true;
  
  console.log('[SIGNAL] Playback ended. Actions executed:', window.__signals__.playbackActions.length);
}

function updateSpeedText() {
  speedText.setText('Playback Speed: ' + playbackSpeed.toFixed(1) + 'x');
  window.__signals__.playbackSpeed = playbackSpeed;
}

function update(time, delta) {
  // 录制模式
  if (isRecording) {
    const elapsed = Date.now() - recordingStartTime;
    
    if (elapsed >= RECORDING_DURATION) {
      stopRecording();
    } else {
      // 更新状态文本显示剩余时间
      const remaining = ((RECORDING_DURATION - elapsed) / 1000).toFixed(1);
      statusText.setText('Status: Recording (' + remaining + 's)');
    }
  }

  // 玩家控制（非回放时）
  if (!isPlayback) {
    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown) vx = -speed;
    if (cursors.right.isDown) vx = speed;
    if (cursors.up.isDown) vy = -speed;
    if (cursors.down.isDown) vy = speed;

    player.x += vx * delta / 1000;
    player.y += vy * delta / 1000;

    // 边界限制
    player.x = Phaser.Math.Clamp(player.x, 16, 784);
    player.y = Phaser.Math.Clamp(player.y, 16, 584);

    // 录制操作
    if (isRecording) {
      const timestamp = Date.now() - recordingStartTime;
      recordedActions.push({
        time: timestamp,
        x: player.x,
        y: player.y,
        vx: vx,
        vy: vy
      });
    }
  }

  // 回放模式
  if (isPlayback) {
    const elapsed = (Date.now() - playbackStartTime) * playbackSpeed;
    
    // 找到当前应该执行的动作
    while (currentActionIndex < recordedActions.length) {
      const action = recordedActions[currentActionIndex];
      
      if (action.time <= elapsed) {
        playbackGhost.setPosition(action.x, action.y);
        
        window.__signals__.playbackActions.push({
          index: currentActionIndex,
          time: action.time,
          x: action.x,
          y: action.y
        });
        
        currentActionIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (currentActionIndex >= recordedActions.length) {
      stopPlayback();
    }
  }
}

new Phaser.Game(config);