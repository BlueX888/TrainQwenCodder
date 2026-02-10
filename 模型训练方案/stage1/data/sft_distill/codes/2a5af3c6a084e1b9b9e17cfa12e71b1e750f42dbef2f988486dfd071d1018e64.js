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

// 全局状态变量
let player;
let graphics;
let statusText;
let instructionText;
let speedText;
let progressText;

// 录制相关
let recordingStartTime = 0;
let recordingDuration = 2000; // 2秒
let isRecording = false;
let isWaitingForReplay = false;
let isReplaying = false;

// 操作记录
let actionLog = [];
let replayStartTime = 0;
let replaySpeed = 1.0; // 回放速度倍率
let currentReplayIndex = 0;

// 玩家状态
let playerSpeed = 200;
let playerX = 400;
let playerY = 300;

// 键盘输入
let keys = {};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建玩家方块（使用Graphics）
  graphics = this.add.graphics();
  drawPlayer(playerX, playerY);

  // 创建UI文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  instructionText = this.add.text(10, 50, 
    'WASD: 移动 | 录制2秒后点击鼠标左键回放\n数字键 1/2/3: 切换速度 (1x/2x/0.5x)', {
    fontSize: '16px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  speedText = this.add.text(10, 120, '', {
    fontSize: '18px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  progressText = this.add.text(10, 160, '', {
    fontSize: '18px',
    color: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 设置键盘输入
  keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 速度切换键
  keys.ONE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
  keys.TWO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
  keys.THREE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

  // 鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown() && isWaitingForReplay) {
      startReplay(this);
    }
  });

  // 开始录制
  startRecording(this);
}

function update(time, delta) {
  // 处理速度切换
  if (Phaser.Input.Keyboard.JustDown(keys.ONE)) {
    replaySpeed = 1.0;
  } else if (Phaser.Input.Keyboard.JustDown(keys.TWO)) {
    replaySpeed = 2.0;
  } else if (Phaser.Input.Keyboard.JustDown(keys.THREE)) {
    replaySpeed = 0.5;
  }

  speedText.setText(`回放速度: ${replaySpeed}x`);

  if (isRecording) {
    // 录制阶段
    const elapsed = time - recordingStartTime;
    
    if (elapsed >= recordingDuration) {
      // 录制结束
      stopRecording();
    } else {
      // 记录当前操作
      recordActions(time, delta);
      // 更新玩家位置
      updatePlayerPosition(delta);
      
      const remaining = ((recordingDuration - elapsed) / 1000).toFixed(1);
      statusText.setText(`录制中... 剩余: ${remaining}秒`);
      progressText.setText(`已记录操作: ${actionLog.length} 条`);
    }
  } else if (isReplaying) {
    // 回放阶段
    replayActions(time);
    
    const progress = ((currentReplayIndex / actionLog.length) * 100).toFixed(0);
    statusText.setText(`回放中... 进度: ${progress}%`);
    progressText.setText(`操作 ${currentReplayIndex}/${actionLog.length}`);
  } else if (isWaitingForReplay) {
    statusText.setText('录制完成！点击鼠标左键开始回放');
    progressText.setText(`已记录 ${actionLog.length} 条操作`);
  }

  // 重绘玩家
  drawPlayer(playerX, playerY);
}

function startRecording(scene) {
  isRecording = true;
  isWaitingForReplay = false;
  isReplaying = false;
  recordingStartTime = scene.time.now;
  actionLog = [];
  
  // 重置玩家位置
  playerX = 400;
  playerY = 300;
}

function recordActions(time, delta) {
  // 记录当前时间戳和按键状态
  const action = {
    timestamp: time - recordingStartTime,
    keys: {
      W: keys.W.isDown,
      A: keys.A.isDown,
      S: keys.S.isDown,
      D: keys.D.isDown
    },
    delta: delta
  };
  
  actionLog.push(action);
}

function updatePlayerPosition(delta) {
  const moveDistance = (playerSpeed * delta) / 1000;
  
  if (keys.W.isDown) {
    playerY -= moveDistance;
  }
  if (keys.S.isDown) {
    playerY += moveDistance;
  }
  if (keys.A.isDown) {
    playerX -= moveDistance;
  }
  if (keys.D.isDown) {
    playerX += moveDistance;
  }
  
  // 边界限制
  playerX = Phaser.Math.Clamp(playerX, 25, 775);
  playerY = Phaser.Math.Clamp(playerY, 25, 575);
}

function stopRecording() {
  isRecording = false;
  isWaitingForReplay = true;
}

function startReplay(scene) {
  isWaitingForReplay = false;
  isReplaying = true;
  replayStartTime = scene.time.now;
  currentReplayIndex = 0;
  
  // 重置玩家位置到起始点
  playerX = 400;
  playerY = 300;
}

function replayActions(time) {
  if (currentReplayIndex >= actionLog.length) {
    // 回放结束，重新开始录制
    isReplaying = false;
    const scene = game.scene.scenes[0];
    startRecording(scene);
    return;
  }
  
  const elapsed = (time - replayStartTime) * replaySpeed;
  
  // 播放所有应该在当前时间之前的操作
  while (currentReplayIndex < actionLog.length) {
    const action = actionLog[currentReplayIndex];
    
    if (action.timestamp > elapsed) {
      break;
    }
    
    // 根据记录的按键状态更新位置
    const adjustedDelta = action.delta * replaySpeed;
    const moveDistance = (playerSpeed * adjustedDelta) / 1000;
    
    if (action.keys.W) {
      playerY -= moveDistance;
    }
    if (action.keys.S) {
      playerY += moveDistance;
    }
    if (action.keys.A) {
      playerX -= moveDistance;
    }
    if (action.keys.D) {
      playerX += moveDistance;
    }
    
    // 边界限制
    playerX = Phaser.Math.Clamp(playerX, 25, 775);
    playerY = Phaser.Math.Clamp(playerY, 25, 575);
    
    currentReplayIndex++;
  }
}

function drawPlayer(x, y) {
  graphics.clear();
  
  // 绘制玩家方块
  if (isRecording) {
    graphics.fillStyle(0x00ff00, 1); // 绿色 - 录制中
  } else if (isReplaying) {
    graphics.fillStyle(0xff0000, 1); // 红色 - 回放中
  } else {
    graphics.fillStyle(0xffff00, 1); // 黄色 - 等待中
  }
  
  graphics.fillRect(x - 25, y - 25, 50, 50);
  
  // 绘制方向指示器
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(x, y - 15, 5);
}

const game = new Phaser.Game(config);