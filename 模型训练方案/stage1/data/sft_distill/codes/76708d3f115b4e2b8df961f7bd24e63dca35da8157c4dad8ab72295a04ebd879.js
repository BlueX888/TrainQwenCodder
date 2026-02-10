// 完整的 Phaser3 代码 - 操作序列录制与回放系统
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号记录
window.__signals__ = {
  recordedActions: [],
  replayActions: [],
  events: []
};

let player;
let recordingText;
let statusText;
let speedText;
let replaySpeedText;

// 录制相关变量
let isRecording = false;
let recordedActions = [];
let recordStartTime = 0;
const RECORD_DURATION = 1000; // 1秒

// 回放相关变量
let isReplaying = false;
let replayStartTime = 0;
let currentActionIndex = 0;
let replaySpeed = 1.0; // 回放速度倍率
const REPLAY_SPEEDS = [0.5, 1.0, 2.0];
let currentSpeedIndex = 1;

// 玩家位置
let playerX = 400;
let playerY = 300;
const MOVE_SPEED = 5;

// 键盘输入
let keyW, keyA, keyS, keyD;
let cursorKeys;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建玩家（绿色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(-20, -20, 40, 40);
  graphics.generateTexture('playerTex', 40, 40);
  graphics.destroy();
  
  player = this.add.sprite(playerX, playerY, 'playerTex');
  
  // 创建UI文本
  recordingText = this.add.text(10, 10, '按 WASD 开始录制 (1秒)', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  statusText = this.add.text(10, 50, '状态: 等待中', {
    fontSize: '18px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  speedText = this.add.text(10, 90, '回放速度: 1.0x', {
    fontSize: '18px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  replaySpeedText = this.add.text(10, 130, '↑↓ 调整速度 | ← 开始回放', {
    fontSize: '16px',
    fill: '#aaaaaa',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 操作说明
  this.add.text(10, 550, 'WASD: 移动并录制 | 方向键: 控制回放', {
    fontSize: '16px',
    fill: '#888888'
  });
  
  // 设置键盘输入
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  cursorKeys = this.input.keyboard.createCursorKeys();
  
  // 监听方向键（回放控制）
  cursorKeys.up.on('down', () => {
    if (!isRecording && !isReplaying) {
      currentSpeedIndex = (currentSpeedIndex + 1) % REPLAY_SPEEDS.length;
      replaySpeed = REPLAY_SPEEDS[currentSpeedIndex];
      speedText.setText(`回放速度: ${replaySpeed}x`);
      logEvent('speed_changed', { speed: replaySpeed });
    }
  });
  
  cursorKeys.down.on('down', () => {
    if (!isRecording && !isReplaying) {
      currentSpeedIndex = (currentSpeedIndex - 1 + REPLAY_SPEEDS.length) % REPLAY_SPEEDS.length;
      replaySpeed = REPLAY_SPEEDS[currentSpeedIndex];
      speedText.setText(`回放速度: ${replaySpeed}x`);
      logEvent('speed_changed', { speed: replaySpeed });
    }
  });
  
  cursorKeys.left.on('down', () => {
    if (!isRecording && !isReplaying && recordedActions.length > 0) {
      startReplay(this);
    }
  });
  
  // 监听WASD开始录制
  [keyW, keyA, keyS, keyD].forEach(key => {
    key.on('down', () => {
      if (!isRecording && !isReplaying) {
        startRecording(this);
      }
    });
  });
}

function update(time, delta) {
  // 录制模式
  if (isRecording) {
    const elapsed = time - recordStartTime;
    
    // 检查是否超过1秒
    if (elapsed >= RECORD_DURATION) {
      stopRecording();
      return;
    }
    
    // 更新录制进度
    const progress = (elapsed / RECORD_DURATION * 100).toFixed(0);
    recordingText.setText(`录制中... ${progress}%`);
    
    // 记录按键操作
    if (keyW.isDown) {
      recordAction('W', elapsed);
      playerY -= MOVE_SPEED;
    }
    if (keyA.isDown) {
      recordAction('A', elapsed);
      playerX -= MOVE_SPEED;
    }
    if (keyS.isDown) {
      recordAction('S', elapsed);
      playerY += MOVE_SPEED;
    }
    if (keyD.isDown) {
      recordAction('D', elapsed);
      playerX += MOVE_SPEED;
    }
    
    // 边界限制
    playerX = Phaser.Math.Clamp(playerX, 20, 780);
    playerY = Phaser.Math.Clamp(playerY, 20, 580);
    
    player.setPosition(playerX, playerY);
  }
  
  // 回放模式
  if (isReplaying) {
    const elapsed = (time - replayStartTime) * replaySpeed;
    
    // 执行所有应该执行的操作
    while (currentActionIndex < recordedActions.length) {
      const action = recordedActions[currentActionIndex];
      
      if (action.timestamp <= elapsed) {
        executeAction(action.key);
        currentActionIndex++;
        
        logEvent('replay_action', {
          key: action.key,
          timestamp: action.timestamp,
          position: { x: playerX, y: playerY }
        });
      } else {
        break;
      }
    }
    
    // 更新位置
    player.setPosition(playerX, playerY);
    
    // 检查是否回放完成
    if (currentActionIndex >= recordedActions.length) {
      stopReplay();
    } else {
      const progress = (currentActionIndex / recordedActions.length * 100).toFixed(0);
      statusText.setText(`状态: 回放中 ${progress}%`);
    }
  }
}

function startRecording(scene) {
  isRecording = true;
  recordedActions = [];
  recordStartTime = scene.time.now;
  
  // 重置玩家位置
  playerX = 400;
  playerY = 300;
  player.setPosition(playerX, playerY);
  
  statusText.setText('状态: 录制中...');
  logEvent('recording_started', { startTime: recordStartTime });
}

function stopRecording() {
  isRecording = false;
  recordingText.setText(`录制完成 (${recordedActions.length} 个操作)`);
  statusText.setText('状态: 录制完成，按 ← 回放');
  
  // 保存到全局信号
  window.__signals__.recordedActions = [...recordedActions];
  
  logEvent('recording_stopped', {
    actionCount: recordedActions.length,
    actions: recordedActions
  });
}

function recordAction(key, timestamp) {
  // 避免重复记录（同一帧内相同按键只记录一次）
  const lastAction = recordedActions[recordedActions.length - 1];
  if (!lastAction || lastAction.timestamp !== timestamp || lastAction.key !== key) {
    recordedActions.push({ key, timestamp });
  }
}

function startReplay(scene) {
  isReplaying = true;
  replayStartTime = scene.time.now;
  currentActionIndex = 0;
  
  // 重置玩家位置
  playerX = 400;
  playerY = 300;
  player.setPosition(playerX, playerY);
  
  statusText.setText('状态: 回放中...');
  recordingText.setText(`回放开始 (速度: ${replaySpeed}x)`);
  
  logEvent('replay_started', {
    speed: replaySpeed,
    actionCount: recordedActions.length
  });
}

function stopReplay() {
  isReplaying = false;
  statusText.setText('状态: 回放完成');
  recordingText.setText('按 WASD 重新录制');
  
  // 保存回放结果
  window.__signals__.replayActions = recordedActions.slice(0, currentActionIndex);
  
  logEvent('replay_completed', {
    executedActions: currentActionIndex
  });
}

function executeAction(key) {
  switch (key) {
    case 'W':
      playerY -= MOVE_SPEED;
      break;
    case 'A':
      playerX -= MOVE_SPEED;
      break;
    case 'S':
      playerY += MOVE_SPEED;
      break;
    case 'D':
      playerX += MOVE_SPEED;
      break;
  }
  
  // 边界限制
  playerX = Phaser.Math.Clamp(playerX, 20, 780);
  playerY = Phaser.Math.Clamp(playerY, 20, 580);
}

function logEvent(eventType, data) {
  const event = {
    type: eventType,
    timestamp: Date.now(),
    data: data
  };
  
  window.__signals__.events.push(event);
  console.log(`[EVENT] ${eventType}:`, data);
}

new Phaser.Game(config);