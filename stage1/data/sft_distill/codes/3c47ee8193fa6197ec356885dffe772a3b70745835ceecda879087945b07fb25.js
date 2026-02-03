const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态
let player;
let recordedActions = [];
let isRecording = false;
let isReplaying = false;
let recordStartTime = 0;
let replayStartTime = 0;
let replaySpeed = 1; // 回放速度倍率
let currentReplayIndex = 0;

// 状态信号（可验证）
let totalDistance = 0;
let replayDistance = 0;
let recordDuration = 0;

// UI元素
let statusText;
let distanceText;
let instructionText;

// 按键状态
let keys = {};
let lastPosition = { x: 0, y: 0 };

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家（使用Graphics绘制）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  player = this.add.sprite(400, 300, 'player');
  player.setOrigin(0.5, 0.5);
  lastPosition = { x: player.x, y: player.y };

  // 设置按键监听
  keys.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  keys.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  keys.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
  keys.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  
  // WASD用于开始回放
  keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 数字键控制回放速度
  keys.one = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
  keys.two = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
  keys.three = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

  // 创建UI文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  distanceText = this.add.text(10, 50, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  instructionText = this.add.text(400, 500, '', {
    fontSize: '18px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5, 0.5);

  // 开始录制
  startRecording(this);
}

function startRecording(scene) {
  isRecording = true;
  isReplaying = false;
  recordedActions = [];
  recordStartTime = scene.time.now;
  totalDistance = 0;
  currentReplayIndex = 0;

  statusText.setText('状态: 录制中 (2.5秒)');
  instructionText.setText('使用方向键移动 | 录制将在2.5秒后自动停止');

  // 2.5秒后停止录制
  scene.time.delayedCall(2500, () => {
    stopRecording(scene);
  });
}

function stopRecording(scene) {
  isRecording = false;
  recordDuration = scene.time.now - recordStartTime;
  
  statusText.setText('状态: 录制完成');
  instructionText.setText('按 W/A/S/D 开始回放 | 按 1/2/3 调整速度 (当前: x' + replaySpeed + ')');
  
  console.log('录制完成，共记录', recordedActions.length, '个操作');
}

function startReplay(scene) {
  if (recordedActions.length === 0) {
    return;
  }

  isReplaying = true;
  isRecording = false;
  replayStartTime = scene.time.now;
  currentReplayIndex = 0;
  replayDistance = 0;

  // 重置玩家位置到录制开始位置
  player.x = 400;
  player.y = 300;
  lastPosition = { x: player.x, y: player.y };

  statusText.setText('状态: 回放中 (速度: x' + replaySpeed + ')');
  instructionText.setText('回放中... | 按 1/2/3 调整速度');
}

function recordAction(key, time) {
  if (!isRecording) return;
  
  const relativeTime = time - recordStartTime;
  recordedActions.push({
    key: key,
    time: relativeTime
  });
}

function update(time, delta) {
  const moveSpeed = 200 * (delta / 1000);

  // 录制模式
  if (isRecording) {
    let moved = false;
    
    if (keys.up.isDown) {
      player.y -= moveSpeed;
      recordAction('up', time);
      moved = true;
    }
    if (keys.down.isDown) {
      player.y += moveSpeed;
      recordAction('down', time);
      moved = true;
    }
    if (keys.left.isDown) {
      player.x -= moveSpeed;
      recordAction('left', time);
      moved = true;
    }
    if (keys.right.isDown) {
      player.x += moveSpeed;
      recordAction('right', time);
      moved = true;
    }

    // 计算移动距离
    if (moved) {
      const dx = player.x - lastPosition.x;
      const dy = player.y - lastPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalDistance += dist;
      lastPosition = { x: player.x, y: player.y };
    }

    // 边界限制
    player.x = Phaser.Math.Clamp(player.x, 16, 784);
    player.y = Phaser.Math.Clamp(player.y, 16, 584);

    distanceText.setText(
      '录制距离: ' + totalDistance.toFixed(2) + ' px\n' +
      '操作数: ' + recordedActions.length
    );
  }
  // 等待回放模式
  else if (!isReplaying) {
    // 监听WASD开始回放
    if (Phaser.Input.Keyboard.JustDown(keys.w) ||
        Phaser.Input.Keyboard.JustDown(keys.a) ||
        Phaser.Input.Keyboard.JustDown(keys.s) ||
        Phaser.Input.Keyboard.JustDown(keys.d)) {
      startReplay(this);
    }

    // 调整回放速度
    if (Phaser.Input.Keyboard.JustDown(keys.one)) {
      replaySpeed = 1;
      instructionText.setText('按 W/A/S/D 开始回放 | 按 1/2/3 调整速度 (当前: x' + replaySpeed + ')');
    }
    if (Phaser.Input.Keyboard.JustDown(keys.two)) {
      replaySpeed = 2;
      instructionText.setText('按 W/A/S/D 开始回放 | 按 1/2/3 调整速度 (当前: x' + replaySpeed + ')');
    }
    if (Phaser.Input.Keyboard.JustDown(keys.three)) {
      replaySpeed = 3;
      instructionText.setText('按 W/A/S/D 开始回放 | 按 1/2/3 调整速度 (当前: x' + replaySpeed + ')');
    }
  }
  // 回放模式
  else if (isReplaying) {
    const elapsedTime = (time - replayStartTime) * replaySpeed;
    
    // 处理当前时间点应该执行的所有操作
    while (currentReplayIndex < recordedActions.length) {
      const action = recordedActions[currentReplayIndex];
      
      if (action.time <= elapsedTime) {
        // 执行操作
        const replayMoveSpeed = moveSpeed * replaySpeed;
        
        switch(action.key) {
          case 'up':
            player.y -= replayMoveSpeed;
            break;
          case 'down':
            player.y += replayMoveSpeed;
            break;
          case 'left':
            player.x -= replayMoveSpeed;
            break;
          case 'right':
            player.x += replayMoveSpeed;
            break;
        }
        
        currentReplayIndex++;
      } else {
        break;
      }
    }

    // 计算回放距离
    const dx = player.x - lastPosition.x;
    const dy = player.y - lastPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    replayDistance += dist;
    lastPosition = { x: player.x, y: player.y };

    // 边界限制
    player.x = Phaser.Math.Clamp(player.x, 16, 784);
    player.y = Phaser.Math.Clamp(player.y, 16, 584);

    distanceText.setText(
      '原始距离: ' + totalDistance.toFixed(2) + ' px\n' +
      '回放距离: ' + replayDistance.toFixed(2) + ' px\n' +
      '进度: ' + currentReplayIndex + '/' + recordedActions.length
    );

    // 调整回放速度（回放中也可以调整）
    if (Phaser.Input.Keyboard.JustDown(keys.one)) {
      replaySpeed = 1;
      statusText.setText('状态: 回放中 (速度: x' + replaySpeed + ')');
    }
    if (Phaser.Input.Keyboard.JustDown(keys.two)) {
      replaySpeed = 2;
      statusText.setText('状态: 回放中 (速度: x' + replaySpeed + ')');
    }
    if (Phaser.Input.Keyboard.JustDown(keys.three)) {
      replaySpeed = 3;
      statusText.setText('状态: 回放中 (速度: x' + replaySpeed + ')');
    }

    // 回放完成
    if (currentReplayIndex >= recordedActions.length) {
      isReplaying = false;
      statusText.setText('状态: 回放完成');
      instructionText.setText('按 W/A/S/D 重新开始回放 | 按 1/2/3 调整速度 (当前: x' + replaySpeed + ')');
      
      console.log('回放完成');
      console.log('原始距离:', totalDistance.toFixed(2));
      console.log('回放距离:', replayDistance.toFixed(2));
      console.log('误差:', Math.abs(totalDistance - replayDistance).toFixed(2));
    }
  }
}

new Phaser.Game(config);