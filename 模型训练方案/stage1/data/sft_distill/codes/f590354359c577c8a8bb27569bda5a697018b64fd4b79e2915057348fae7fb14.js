const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证的状态信号）
let recordingState = 'idle'; // 'idle', 'recording', 'replaying'
let playbackSpeed = 1.0;
let operationCount = 0;

// 操作记录
let operations = [];
let recordStartTime = 0;
const RECORD_DURATION = 2500; // 2.5秒

// 玩家状态
let player;
let playerX = 400;
let playerY = 300;
const MOVE_SPEED = 200;

// 回放相关
let replayStartTime = 0;
let replayIndex = 0;
let isReplaying = false;

// 输入
let keys;
let cursors;

// UI文本
let statusText;
let instructionText;
let operationText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建玩家（使用Graphics绘制）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 20);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();

  player = this.add.sprite(playerX, playerY, 'player');

  // 创建回放轨迹显示（半透明）
  this.replayGhost = this.add.sprite(playerX, playerY, 'player');
  this.replayGhost.setAlpha(0.3);
  this.replayGhost.setTint(0xff0000);
  this.replayGhost.setVisible(false);

  // 键盘输入
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  };

  cursors = this.input.keyboard.createCursorKeys();

  // 数字键调速
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () => {
    playbackSpeed = 0.5;
  });
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () => {
    playbackSpeed = 1.0;
  });
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE).on('down', () => {
    playbackSpeed = 2.0;
  });

  // UI文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  instructionText = this.add.text(10, 50, 
    '按空格键开始录制2.5秒\nWASD移动\n方向键任意键开始回放\n1/2/3键调速(0.5x/1x/2x)', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  operationText = this.add.text(10, 150, '', {
    fontSize: '16px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 空格键开始录制
  keys.SPACE.on('down', () => {
    if (recordingState === 'idle') {
      startRecording.call(this);
    }
  });

  // 方向键开始回放
  cursors.up.on('down', () => startReplay.call(this));
  cursors.down.on('down', () => startReplay.call(this));
  cursors.left.on('down', () => startReplay.call(this));
  cursors.right.on('down', () => startReplay.call(this));

  updateUI();
}

function startRecording() {
  recordingState = 'recording';
  operations = [];
  operationCount = 0;
  recordStartTime = Date.now();
  
  playerX = 400;
  playerY = 300;
  player.setPosition(playerX, playerY);

  console.log('开始录制...');

  // 2.5秒后自动停止录制
  this.time.delayedCall(RECORD_DURATION, () => {
    if (recordingState === 'recording') {
      recordingState = 'idle';
      console.log(`录制完成，共记录 ${operations.length} 个操作`);
      updateUI();
    }
  });

  updateUI();
}

function startReplay() {
  if (operations.length === 0 || recordingState === 'replaying') {
    return;
  }

  recordingState = 'replaying';
  replayStartTime = Date.now();
  replayIndex = 0;
  isReplaying = true;

  // 重置玩家位置
  playerX = 400;
  playerY = 300;
  player.setPosition(playerX, playerY);
  
  this.replayGhost.setPosition(playerX, playerY);
  this.replayGhost.setVisible(true);

  console.log(`开始回放，速度: ${playbackSpeed}x`);
  updateUI();
}

function update(time, delta) {
  const deltaSeconds = delta / 1000;

  // 录制模式
  if (recordingState === 'recording') {
    const elapsed = Date.now() - recordStartTime;
    
    if (elapsed <= RECORD_DURATION) {
      let moved = false;
      let direction = '';

      if (keys.W.isDown) {
        playerY -= MOVE_SPEED * deltaSeconds;
        direction = 'W';
        moved = true;
      }
      if (keys.S.isDown) {
        playerY += MOVE_SPEED * deltaSeconds;
        direction = 'S';
        moved = true;
      }
      if (keys.A.isDown) {
        playerX -= MOVE_SPEED * deltaSeconds;
        direction = 'A';
        moved = true;
      }
      if (keys.D.isDown) {
        playerX += MOVE_SPEED * deltaSeconds;
        direction = 'D';
        moved = true;
      }

      // 边界限制
      playerX = Phaser.Math.Clamp(playerX, 20, 780);
      playerY = Phaser.Math.Clamp(playerY, 20, 580);

      player.setPosition(playerX, playerY);

      // 记录操作
      if (moved) {
        operations.push({
          timestamp: elapsed,
          direction: direction,
          x: playerX,
          y: playerY
        });
        operationCount = operations.length;
      }
    }

    updateUI();
  }

  // 回放模式
  if (recordingState === 'replaying' && isReplaying) {
    const elapsed = (Date.now() - replayStartTime) * playbackSpeed;

    // 执行所有应该执行的操作
    while (replayIndex < operations.length && operations[replayIndex].timestamp <= elapsed) {
      const op = operations[replayIndex];
      this.replayGhost.setPosition(op.x, op.y);
      replayIndex++;
    }

    // 回放结束
    if (replayIndex >= operations.length) {
      isReplaying = false;
      recordingState = 'idle';
      this.replayGhost.setVisible(false);
      console.log('回放完成');
      updateUI();
    }
  }
}

function updateUI() {
  let stateStr = '';
  switch (recordingState) {
    case 'idle':
      stateStr = '待机';
      break;
    case 'recording':
      const elapsed = Date.now() - recordStartTime;
      const remaining = Math.max(0, (RECORD_DURATION - elapsed) / 1000).toFixed(1);
      stateStr = `录制中 (剩余${remaining}秒)`;
      break;
    case 'replaying':
      stateStr = `回放中 (速度${playbackSpeed}x)`;
      break;
  }

  statusText.setText(`状态: ${stateStr} | 速度: ${playbackSpeed}x`);
  operationText.setText(`已记录操作: ${operationCount}次`);
}

new Phaser.Game(config);