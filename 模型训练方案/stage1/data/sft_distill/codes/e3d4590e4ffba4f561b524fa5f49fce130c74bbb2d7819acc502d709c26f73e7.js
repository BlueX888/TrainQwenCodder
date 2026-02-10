// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态信号
window.__signals__ = {
  mode: 'recording', // recording, replaying, idle
  recordedActions: 0,
  replaySpeed: 1.0,
  playerPosition: { x: 400, y: 300 },
  logs: []
};

// 游戏状态
let gameState = {
  mode: 'recording', // recording, replaying, idle
  recordingStartTime: 0,
  recordingDuration: 1500, // 1.5秒
  actions: [], // 记录的操作序列 { time: number, key: string }
  player: null,
  replaySpeed: 1.0,
  replayStartTime: 0,
  replayIndex: 0,
  cursors: null,
  wasdKeys: null,
  statusText: null,
  speedText: null,
  instructionText: null,
  moveSpeed: 200
};

function preload() {
  // 无需预加载资源
}

function create() {
  const scene = this;
  
  // 创建玩家（蓝色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillRect(-15, -15, 30, 30);
  graphics.generateTexture('player', 30, 30);
  graphics.destroy();
  
  gameState.player = this.add.sprite(400, 300, 'player');
  
  // 创建UI文本
  gameState.statusText = this.add.text(10, 10, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  gameState.speedText = this.add.text(10, 50, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  gameState.instructionText = this.add.text(400, 550, 
    '录制模式：使用方向键移动 (1.5秒) | 按 WASD 开始回放 | +/- 调整回放速度', {
    fontSize: '14px',
    fill: '#aaaaaa',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);
  
  // 设置输入
  gameState.cursors = this.input.keyboard.createCursorKeys();
  gameState.wasdKeys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    PLUS: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS),
    MINUS: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS),
    EQUALS: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EQUALS),
    UNDERSCORE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UNDERSCORE)
  };
  
  // 开始录制
  startRecording(scene);
  
  // 监听WASD键启动回放
  Object.keys(gameState.wasdKeys).forEach(key => {
    if (['W', 'A', 'S', 'D'].includes(key)) {
      gameState.wasdKeys[key].on('down', () => {
        if (gameState.mode === 'idle') {
          startReplay(scene);
        }
      });
    }
  });
  
  // 监听速度调整键
  gameState.wasdKeys.PLUS.on('down', () => adjustSpeed(0.25));
  gameState.wasdKeys.EQUALS.on('down', () => adjustSpeed(0.25));
  gameState.wasdKeys.MINUS.on('down', () => adjustSpeed(-0.25));
  gameState.wasdKeys.UNDERSCORE.on('down', () => adjustSpeed(-0.25));
  
  updateUI();
}

function update(time, delta) {
  const scene = this;
  
  if (gameState.mode === 'recording') {
    handleRecordingInput(time, delta);
    checkRecordingTimeout(time, scene);
  } else if (gameState.mode === 'replaying') {
    handleReplay(time, delta);
  }
  
  updateUI();
}

function startRecording(scene) {
  gameState.mode = 'recording';
  gameState.recordingStartTime = scene.time.now;
  gameState.actions = [];
  gameState.player.setPosition(400, 300);
  
  logSignal('recording_started', { time: scene.time.now });
  window.__signals__.mode = 'recording';
  window.__signals__.recordedActions = 0;
}

function handleRecordingInput(time, delta) {
  const elapsed = time - gameState.recordingStartTime;
  let moved = false;
  
  // 记录并执行移动
  if (gameState.cursors.left.isDown) {
    recordAction(elapsed, 'LEFT');
    gameState.player.x -= gameState.moveSpeed * (delta / 1000);
    moved = true;
  }
  if (gameState.cursors.right.isDown) {
    recordAction(elapsed, 'RIGHT');
    gameState.player.x += gameState.moveSpeed * (delta / 1000);
    moved = true;
  }
  if (gameState.cursors.up.isDown) {
    recordAction(elapsed, 'UP');
    gameState.player.y -= gameState.moveSpeed * (delta / 1000);
    moved = true;
  }
  if (gameState.cursors.down.isDown) {
    recordAction(elapsed, 'DOWN');
    gameState.player.y += gameState.moveSpeed * (delta / 1000);
    moved = true;
  }
  
  // 边界限制
  gameState.player.x = Phaser.Math.Clamp(gameState.player.x, 15, 785);
  gameState.player.y = Phaser.Math.Clamp(gameState.player.y, 15, 585);
  
  if (moved) {
    window.__signals__.playerPosition = { 
      x: Math.round(gameState.player.x), 
      y: Math.round(gameState.player.y) 
    };
  }
}

function recordAction(time, key) {
  // 避免重复记录（每帧只记录一次相同按键）
  const lastAction = gameState.actions[gameState.actions.length - 1];
  if (!lastAction || lastAction.key !== key || time - lastAction.time > 16) {
    gameState.actions.push({ time, key });
    window.__signals__.recordedActions = gameState.actions.length;
  }
}

function checkRecordingTimeout(time, scene) {
  const elapsed = time - gameState.recordingStartTime;
  if (elapsed >= gameState.recordingDuration) {
    endRecording(scene);
  }
}

function endRecording(scene) {
  gameState.mode = 'idle';
  
  // 去重和优化操作序列
  const optimizedActions = [];
  for (let i = 0; i < gameState.actions.length; i++) {
    const action = gameState.actions[i];
    const nextAction = gameState.actions[i + 1];
    
    // 如果下一个动作在很短时间内且是相同按键，跳过当前
    if (!nextAction || nextAction.key !== action.key || nextAction.time - action.time > 50) {
      optimizedActions.push(action);
    }
  }
  
  gameState.actions = optimizedActions;
  
  logSignal('recording_ended', { 
    totalActions: gameState.actions.length,
    duration: gameState.recordingDuration 
  });
  
  window.__signals__.mode = 'idle';
  window.__signals__.recordedActions = gameState.actions.length;
}

function startReplay(scene) {
  if (gameState.actions.length === 0) {
    return;
  }
  
  gameState.mode = 'replaying';
  gameState.replayStartTime = scene.time.now;
  gameState.replayIndex = 0;
  gameState.player.setPosition(400, 300);
  
  logSignal('replay_started', { 
    speed: gameState.replaySpeed,
    actions: gameState.actions.length 
  });
  
  window.__signals__.mode = 'replaying';
}

function handleReplay(time, delta) {
  const elapsed = (time - gameState.replayStartTime) * gameState.replaySpeed;
  
  // 执行所有应该在当前时间之前的动作
  while (gameState.replayIndex < gameState.actions.length) {
    const action = gameState.actions[gameState.replayIndex];
    
    if (action.time <= elapsed) {
      executeAction(action.key, delta / gameState.replaySpeed);
      gameState.replayIndex++;
    } else {
      break;
    }
  }
  
  // 边界限制
  gameState.player.x = Phaser.Math.Clamp(gameState.player.x, 15, 785);
  gameState.player.y = Phaser.Math.Clamp(gameState.player.y, 15, 585);
  
  window.__signals__.playerPosition = { 
    x: Math.round(gameState.player.x), 
    y: Math.round(gameState.player.y) 
  };
  
  // 检查回放是否结束
  if (gameState.replayIndex >= gameState.actions.length && 
      elapsed >= gameState.recordingDuration) {
    endReplay();
  }
}

function executeAction(key, delta) {
  const distance = gameState.moveSpeed * (delta / 1000);
  
  switch (key) {
    case 'LEFT':
      gameState.player.x -= distance;
      break;
    case 'RIGHT':
      gameState.player.x += distance;
      break;
    case 'UP':
      gameState.player.y -= distance;
      break;
    case 'DOWN':
      gameState.player.y += distance;
      break;
  }
}

function endReplay() {
  gameState.mode = 'idle';
  
  logSignal('replay_ended', { 
    finalPosition: { 
      x: Math.round(gameState.player.x), 
      y: Math.round(gameState.player.y) 
    } 
  });
  
  window.__signals__.mode = 'idle';
}

function adjustSpeed(delta) {
  gameState.replaySpeed = Phaser.Math.Clamp(
    gameState.replaySpeed + delta, 
    0.25, 
    4.0
  );
  gameState.replaySpeed = Math.round(gameState.replaySpeed * 100) / 100;
  
  window.__signals__.replaySpeed = gameState.replaySpeed;
  
  logSignal('speed_adjusted', { speed: gameState.replaySpeed });
}

function updateUI() {
  let statusMsg = '';
  let timeRemaining = 0;
  
  if (gameState.mode === 'recording') {
    const elapsed = Date.now() - gameState.recordingStartTime;
    timeRemaining = Math.max(0, (gameState.recordingDuration - elapsed) / 1000);
    statusMsg = `🔴 录制中... ${timeRemaining.toFixed(1)}s | 操作数: ${gameState.actions.length}`;
  } else if (gameState.mode === 'replaying') {
    statusMsg = `▶️ 回放中... | 操作: ${gameState.replayIndex}/${gameState.actions.length}`;
  } else {
    statusMsg = `⏸️ 待机 | 已录制: ${gameState.actions.length} 个操作 | 按 WASD 开始回放`;
  }
  
  gameState.statusText.setText(statusMsg);
  gameState.speedText.setText(`回放速度: ${gameState.replaySpeed.toFixed(2)}x (按 +/- 调整)`);
}

function logSignal(event, data) {
  const log = {
    event,
    timestamp: Date.now(),
    data
  };
  window.__signals__.logs.push(log);
  console.log('[SIGNAL]', JSON.stringify(log));
}

// 启动游戏
new Phaser.Game(config);