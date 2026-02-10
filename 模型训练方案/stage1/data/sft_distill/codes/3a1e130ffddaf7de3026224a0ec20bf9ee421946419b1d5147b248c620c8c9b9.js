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
  playbackSpeed: 1.0,
  playbackProgress: 0,
  playerPosition: { x: 400, y: 300 }
};

// 游戏状态
let gameState = {
  mode: 'recording', // recording, replaying, idle
  recordStartTime: 0,
  recordDuration: 1000, // 1秒
  actions: [], // 记录的操作序列
  playbackIndex: 0,
  playbackSpeed: 1.0,
  playbackStartTime: 0,
  player: null,
  keys: null,
  statusText: null,
  instructionText: null
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建玩家（使用 Graphics 绘制）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();
  
  gameState.player = this.add.sprite(400, 300, 'player');
  gameState.player.setOrigin(0.5);
  
  // 创建键盘输入
  gameState.keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    UP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    DOWN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    LEFT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    RIGHT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
  };
  
  // 状态文本
  gameState.statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 指令文本
  gameState.instructionText = this.add.text(10, 550, 
    'WASD: Move | Arrow Keys: Start Replay | ↑↓: Speed ±0.5x | ←→: Start Replay', {
    fontSize: '14px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 5, y: 3 }
  });
  
  // 开始录制
  startRecording(scene);
  
  // 监听方向键开始回放
  gameState.keys.LEFT.on('down', () => startReplay(scene));
  gameState.keys.RIGHT.on('down', () => startReplay(scene));
  
  // 监听上下键调整速度
  gameState.keys.UP.on('down', () => adjustSpeed(0.5));
  gameState.keys.DOWN.on('down', () => adjustSpeed(-0.5));
}

function update(time, delta) {
  const moveSpeed = 200 * (delta / 1000);
  
  if (gameState.mode === 'recording') {
    // 录制模式：记录玩家输入
    handleRecordingInput(time, moveSpeed);
    
    // 检查录制时间是否结束
    if (time - gameState.recordStartTime >= gameState.recordDuration) {
      endRecording();
    }
  } else if (gameState.mode === 'replaying') {
    // 回放模式：重放操作序列
    handleReplay(time);
  }
  
  // 更新状态文本
  updateStatusText();
  
  // 更新全局信号
  updateSignals();
}

function startRecording(scene) {
  gameState.mode = 'recording';
  gameState.recordStartTime = scene.time.now;
  gameState.actions = [];
  gameState.player.x = 400;
  gameState.player.y = 300;
  
  console.log('[Recording Started]', { time: gameState.recordStartTime });
}

function handleRecordingInput(time, moveSpeed) {
  const keys = gameState.keys;
  let moved = false;
  let direction = null;
  
  if (keys.W.isDown) {
    gameState.player.y -= moveSpeed;
    direction = 'W';
    moved = true;
  }
  if (keys.S.isDown) {
    gameState.player.y += moveSpeed;
    direction = 'S';
    moved = true;
  }
  if (keys.A.isDown) {
    gameState.player.x -= moveSpeed;
    direction = 'A';
    moved = true;
  }
  if (keys.D.isDown) {
    gameState.player.x += moveSpeed;
    direction = 'D';
    moved = true;
  }
  
  // 记录操作（带时间戳）
  if (moved && direction) {
    const relativeTime = time - gameState.recordStartTime;
    gameState.actions.push({
      time: relativeTime,
      direction: direction,
      position: { x: gameState.player.x, y: gameState.player.y }
    });
  }
  
  // 边界检查
  gameState.player.x = Phaser.Math.Clamp(gameState.player.x, 20, 780);
  gameState.player.y = Phaser.Math.Clamp(gameState.player.y, 20, 580);
}

function endRecording() {
  gameState.mode = 'idle';
  console.log('[Recording Ended]', {
    totalActions: gameState.actions.length,
    actions: gameState.actions
  });
}

function startReplay(scene) {
  if (gameState.actions.length === 0) {
    console.log('[Replay Failed] No actions recorded');
    return;
  }
  
  gameState.mode = 'replaying';
  gameState.playbackIndex = 0;
  gameState.playbackStartTime = scene.time.now;
  gameState.player.x = 400;
  gameState.player.y = 300;
  
  console.log('[Replay Started]', {
    speed: gameState.playbackSpeed,
    totalActions: gameState.actions.length
  });
}

function handleReplay(time) {
  const elapsedTime = (time - gameState.playbackStartTime) * gameState.playbackSpeed;
  
  // 遍历所有应该执行的操作
  while (gameState.playbackIndex < gameState.actions.length) {
    const action = gameState.actions[gameState.playbackIndex];
    
    if (action.time <= elapsedTime) {
      // 执行操作（直接设置位置以确保准确性）
      gameState.player.x = action.position.x;
      gameState.player.y = action.position.y;
      
      console.log('[Replay Action]', {
        index: gameState.playbackIndex,
        direction: action.direction,
        position: action.position
      });
      
      gameState.playbackIndex++;
    } else {
      break;
    }
  }
  
  // 检查回放是否结束
  if (gameState.playbackIndex >= gameState.actions.length) {
    endReplay();
  }
}

function endReplay() {
  gameState.mode = 'idle';
  console.log('[Replay Ended]', {
    totalActionsReplayed: gameState.playbackIndex
  });
  
  // 重新开始录制
  setTimeout(() => {
    startRecording(window.game.scene.scenes[0]);
  }, 500);
}

function adjustSpeed(delta) {
  gameState.playbackSpeed = Phaser.Math.Clamp(
    gameState.playbackSpeed + delta,
    0.5,
    3.0
  );
  console.log('[Speed Adjusted]', { newSpeed: gameState.playbackSpeed });
}

function updateStatusText() {
  const mode = gameState.mode.toUpperCase();
  const actionCount = gameState.actions.length;
  const speed = gameState.playbackSpeed.toFixed(1);
  const progress = gameState.mode === 'replaying' 
    ? `${gameState.playbackIndex}/${actionCount}`
    : '-';
  
  gameState.statusText.setText(
    `Mode: ${mode}\n` +
    `Actions Recorded: ${actionCount}\n` +
    `Playback Speed: ${speed}x\n` +
    `Progress: ${progress}`
  );
}

function updateSignals() {
  window.__signals__.mode = gameState.mode;
  window.__signals__.recordedActions = gameState.actions.length;
  window.__signals__.playbackSpeed = gameState.playbackSpeed;
  window.__signals__.playbackProgress = gameState.mode === 'replaying'
    ? gameState.playbackIndex / Math.max(1, gameState.actions.length)
    : 0;
  window.__signals__.playerPosition = {
    x: Math.round(gameState.player.x),
    y: Math.round(gameState.player.y)
  };
}

// 创建游戏实例
const game = new Phaser.Game(config);
window.game = game;