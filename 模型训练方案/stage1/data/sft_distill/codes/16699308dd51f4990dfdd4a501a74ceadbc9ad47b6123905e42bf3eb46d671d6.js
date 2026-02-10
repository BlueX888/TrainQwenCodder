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

// 全局信号记录
window.__signals__ = {
  recordings: [],
  replays: [],
  currentState: 'idle',
  playbackSpeed: 1
};

// 游戏状态
let gameState = {
  mode: 'idle', // idle, recording, replaying
  recordingStartTime: 0,
  recordingDuration: 500, // 0.5秒 = 500毫秒
  recordedActions: [],
  replayIndex: 0,
  replaySpeed: 1,
  replaySpeedMultiplier: 1,
  player: null,
  initialPlayerPos: { x: 400, y: 300 }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建玩家（绿色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();
  
  gameState.player = this.add.sprite(
    gameState.initialPlayerPos.x,
    gameState.initialPlayerPos.y,
    'player'
  );
  
  // 创建UI文本
  const statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  const instructionText = this.add.text(10, 50, 
    'WASD: Move | SPACE: Start Replay | 1/2/3: Speed (1x/2x/4x)\nMove for 0.5s, then press SPACE to replay',
    {
      fontSize: '14px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  
  const recordingIndicator = this.add.graphics();
  
  // 键盘输入
  const keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
  };
  
  // 速度切换
  keys.ONE.on('down', () => {
    gameState.replaySpeed = 1;
    window.__signals__.playbackSpeed = 1;
  });
  
  keys.TWO.on('down', () => {
    gameState.replaySpeed = 2;
    window.__signals__.playbackSpeed = 2;
  });
  
  keys.THREE.on('down', () => {
    gameState.replaySpeed = 4;
    window.__signals__.playbackSpeed = 4;
  });
  
  // 空格键开始回放
  keys.SPACE.on('down', () => {
    if (gameState.mode === 'idle' && gameState.recordedActions.length > 0) {
      startReplay(scene);
    }
  });
  
  // 存储到场景数据
  this.gameData = {
    keys,
    statusText,
    recordingIndicator
  };
  
  // 初始化状态
  updateStatus(statusText, recordingIndicator);
  
  // 记录初始信号
  window.__signals__.currentState = 'idle';
  console.log('[SIGNAL] Game initialized');
}

function update(time, delta) {
  const { keys, statusText, recordingIndicator } = this.gameData;
  
  if (gameState.mode === 'idle') {
    // 空闲模式：检测输入并开始录制
    const hasInput = keys.W.isDown || keys.A.isDown || keys.S.isDown || keys.D.isDown;
    
    if (hasInput && gameState.recordedActions.length === 0) {
      startRecording(time);
    }
    
    if (gameState.mode === 'recording') {
      handleRecording(time, keys);
    } else if (hasInput) {
      // 即使不在录制，也允许移动
      movePlayer(keys, delta);
    }
  } else if (gameState.mode === 'recording') {
    handleRecording(time, keys);
  } else if (gameState.mode === 'replaying') {
    handleReplay(delta);
  }
  
  updateStatus(statusText, recordingIndicator);
}

function startRecording(time) {
  gameState.mode = 'recording';
  gameState.recordingStartTime = time;
  gameState.recordedActions = [];
  gameState.initialPlayerPos = {
    x: gameState.player.x,
    y: gameState.player.y
  };
  
  window.__signals__.currentState = 'recording';
  window.__signals__.recordings.push({
    startTime: time,
    startPos: { ...gameState.initialPlayerPos }
  });
  
  console.log('[SIGNAL] Recording started at', time);
}

function handleRecording(time, keys) {
  const elapsed = time - gameState.recordingStartTime;
  
  if (elapsed >= gameState.recordingDuration) {
    // 录制结束
    gameState.mode = 'idle';
    window.__signals__.currentState = 'idle';
    window.__signals__.recordings[window.__signals__.recordings.length - 1].endTime = time;
    window.__signals__.recordings[window.__signals__.recordings.length - 1].frameCount = gameState.recordedActions.length;
    console.log('[SIGNAL] Recording finished, frames:', gameState.recordedActions.length);
    return;
  }
  
  // 记录当前帧的输入状态
  const action = {
    time: elapsed,
    keys: {
      W: keys.W.isDown,
      A: keys.A.isDown,
      S: keys.S.isDown,
      D: keys.D.isDown
    },
    position: {
      x: gameState.player.x,
      y: gameState.player.y
    }
  };
  
  gameState.recordedActions.push(action);
  
  // 执行移动
  movePlayer(keys, 16.67); // 假设60fps
}

function movePlayer(keys, delta) {
  const speed = 200; // 像素/秒
  const distance = speed * (delta / 1000);
  
  if (keys.W.isDown) {
    gameState.player.y -= distance;
  }
  if (keys.S.isDown) {
    gameState.player.y += distance;
  }
  if (keys.A.isDown) {
    gameState.player.x -= distance;
  }
  if (keys.D.isDown) {
    gameState.player.x += distance;
  }
  
  // 边界限制
  gameState.player.x = Phaser.Math.Clamp(gameState.player.x, 20, 780);
  gameState.player.y = Phaser.Math.Clamp(gameState.player.y, 20, 580);
}

function startReplay(scene) {
  gameState.mode = 'replaying';
  gameState.replayIndex = 0;
  gameState.replaySpeedMultiplier = 0;
  
  // 重置玩家位置
  gameState.player.x = gameState.initialPlayerPos.x;
  gameState.player.y = gameState.initialPlayerPos.y;
  
  window.__signals__.currentState = 'replaying';
  window.__signals__.replays.push({
    startTime: scene.time.now,
    speed: gameState.replaySpeed,
    frameCount: gameState.recordedActions.length
  });
  
  console.log('[SIGNAL] Replay started, speed:', gameState.replaySpeed + 'x');
}

function handleReplay(delta) {
  if (gameState.replayIndex >= gameState.recordedActions.length) {
    // 回放结束
    gameState.mode = 'idle';
    window.__signals__.currentState = 'idle';
    window.__signals__.replays[window.__signals__.replays.length - 1].endTime = Date.now();
    console.log('[SIGNAL] Replay finished');
    return;
  }
  
  // 根据速度倍率推进回放
  gameState.replaySpeedMultiplier += delta * gameState.replaySpeed / 16.67;
  
  while (gameState.replaySpeedMultiplier >= 1 && gameState.replayIndex < gameState.recordedActions.length) {
    const action = gameState.recordedActions[gameState.replayIndex];
    gameState.player.x = action.position.x;
    gameState.player.y = action.position.y;
    
    gameState.replayIndex++;
    gameState.replaySpeedMultiplier -= 1;
  }
}

function updateStatus(statusText, recordingIndicator) {
  let status = '';
  
  if (gameState.mode === 'recording') {
    const elapsed = gameState.recordedActions.length * 16.67;
    const remaining = gameState.recordingDuration - elapsed;
    status = `🔴 RECORDING: ${Math.max(0, remaining).toFixed(0)}ms remaining (${gameState.recordedActions.length} frames)`;
    
    // 绘制录制指示器
    recordingIndicator.clear();
    recordingIndicator.fillStyle(0xff0000, 1);
    recordingIndicator.fillCircle(780, 20, 10);
  } else if (gameState.mode === 'replaying') {
    const progress = ((gameState.replayIndex / gameState.recordedActions.length) * 100).toFixed(0);
    status = `▶️ REPLAYING: ${progress}% (Speed: ${gameState.replaySpeed}x)`;
    recordingIndicator.clear();
  } else {
    status = `⏸️ IDLE: ${gameState.recordedActions.length} frames recorded (Speed: ${gameState.replaySpeed}x)`;
    recordingIndicator.clear();
  }
  
  statusText.setText(status);
}

// 启动游戏
new Phaser.Game(config);