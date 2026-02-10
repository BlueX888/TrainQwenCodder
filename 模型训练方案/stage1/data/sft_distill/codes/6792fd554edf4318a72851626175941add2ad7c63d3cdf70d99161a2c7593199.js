const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态
let player;
let recordingBuffer = [];
let isRecording = true;
let isReplaying = false;
let replayIndex = 0;
let replaySpeed = 1.0;
let recordStartTime = 0;
let replayStartTime = 0;

// 输入状态
let cursors;
let wasdKeys;

// UI元素
let statusText;
let speedText;
let instructionText;

// 可验证状态
let totalDistance = 0;
let replayCount = 0;

const RECORD_DURATION = 2500; // 2.5秒
const PLAYER_SPEED = 200;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'player');
  player.x = 400;
  player.y = 300;

  // 创建轨迹图形（用于可视化）
  const trailGraphics = this.add.graphics();
  trailGraphics.lineStyle(2, 0x00ff00, 0.3);

  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  wasdKeys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 监听WASD按键触发回放
  wasdKeys.W.on('down', triggerReplay);
  wasdKeys.A.on('down', triggerReplay);
  wasdKeys.S.on('down', triggerReplay);
  wasdKeys.D.on('down', triggerReplay);

  // 速度调节键
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS).on('down', () => {
    if (isReplaying) {
      replaySpeed = Math.min(replaySpeed + 0.5, 5.0);
      updateSpeedText();
    }
  });

  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS).on('down', () => {
    if (isReplaying) {
      replaySpeed = Math.max(replaySpeed - 0.5, 0.5);
      updateSpeedText();
    }
  });

  // UI文本
  statusText = this.add.text(10, 10, 'Status: RECORDING', {
    fontSize: '20px',
    fill: '#00ff00',
    fontFamily: 'Arial'
  });

  speedText = this.add.text(10, 40, 'Speed: 1.0x', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  instructionText = this.add.text(10, 70, 
    'Arrow Keys: Move\nWASD: Start Replay\n+/- : Adjust Speed', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  const statsText = this.add.text(10, 550, '', {
    fontSize: '14px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  });

  // 初始化录制
  recordStartTime = this.time.now;
  isRecording = true;

  // 回放触发函数
  function triggerReplay() {
    if (!isReplaying && recordingBuffer.length > 0) {
      isReplaying = true;
      isRecording = false;
      replayIndex = 0;
      replayStartTime = this.scene.time.now;
      replayCount++;
      
      // 重置玩家位置到录制起点
      if (recordingBuffer.length > 0) {
        player.x = recordingBuffer[0].x;
        player.y = recordingBuffer[0].y;
      }
      
      statusText.setText('Status: REPLAYING');
      statusText.setColor('#ff00ff');
      updateSpeedText();
    }
  }

  function updateSpeedText() {
    speedText.setText(`Speed: ${replaySpeed.toFixed(1)}x`);
  }

  // 更新统计信息
  this.time.addEvent({
    delay: 100,
    callback: () => {
      statsText.setText(
        `Distance: ${totalDistance.toFixed(0)}px | Replays: ${replayCount} | Buffer: ${recordingBuffer.length}`
      );
    },
    loop: true
  });
}

function update(time, delta) {
  if (isRecording) {
    // 录制模式：记录玩家操作
    const inputState = {
      timestamp: time - recordStartTime,
      left: cursors.left.isDown,
      right: cursors.right.isDown,
      up: cursors.up.isDown,
      down: cursors.down.isDown,
      x: player.x,
      y: player.y
    };

    // 应用移动
    const velocity = { x: 0, y: 0 };
    if (cursors.left.isDown) velocity.x = -PLAYER_SPEED;
    if (cursors.right.isDown) velocity.x = PLAYER_SPEED;
    if (cursors.up.isDown) velocity.y = -PLAYER_SPEED;
    if (cursors.down.isDown) velocity.y = PLAYER_SPEED;

    // 归一化对角线速度
    if (velocity.x !== 0 && velocity.y !== 0) {
      velocity.x *= 0.707;
      velocity.y *= 0.707;
    }

    const oldX = player.x;
    const oldY = player.y;
    
    player.x += velocity.x * (delta / 1000);
    player.y += velocity.y * (delta / 1000);

    // 边界限制
    player.x = Phaser.Math.Clamp(player.x, 16, 784);
    player.y = Phaser.Math.Clamp(player.y, 16, 584);

    // 计算移动距离
    const dist = Phaser.Math.Distance.Between(oldX, oldY, player.x, player.y);
    totalDistance += dist;

    // 记录到缓冲区
    recordingBuffer.push(inputState);

    // 保持2.5秒的缓冲区
    const currentDuration = time - recordStartTime;
    if (currentDuration > RECORD_DURATION) {
      // 移除超过2.5秒的旧数据
      recordingBuffer = recordingBuffer.filter(
        record => (time - recordStartTime - record.timestamp) <= RECORD_DURATION
      );
      // 重置时间基准
      recordStartTime = time - RECORD_DURATION;
      recordingBuffer.forEach(record => {
        record.timestamp = record.timestamp - (currentDuration - RECORD_DURATION);
      });
    }

  } else if (isReplaying) {
    // 回放模式：重现录制的操作
    const elapsedTime = (time - replayStartTime) * replaySpeed;

    // 找到当前应该回放的帧
    while (replayIndex < recordingBuffer.length && 
           recordingBuffer[replayIndex].timestamp <= elapsedTime) {
      
      const record = recordingBuffer[replayIndex];
      
      // 应用录制的移动
      const velocity = { x: 0, y: 0 };
      if (record.left) velocity.x = -PLAYER_SPEED;
      if (record.right) velocity.x = PLAYER_SPEED;
      if (record.up) velocity.y = -PLAYER_SPEED;
      if (record.down) velocity.y = PLAYER_SPEED;

      if (velocity.x !== 0 && velocity.y !== 0) {
        velocity.x *= 0.707;
        velocity.y *= 0.707;
      }

      player.x += velocity.x * (delta / 1000) * replaySpeed;
      player.y += velocity.y * (delta / 1000) * replaySpeed;

      player.x = Phaser.Math.Clamp(player.x, 16, 784);
      player.y = Phaser.Math.Clamp(player.y, 16, 584);

      replayIndex++;
    }

    // 回放结束，返回录制模式
    if (replayIndex >= recordingBuffer.length) {
      isReplaying = false;
      isRecording = true;
      recordStartTime = time;
      recordingBuffer = [];
      
      statusText.setText('Status: RECORDING');
      statusText.setColor('#00ff00');
      speedText.setText('Speed: 1.0x');
    }
  }
}

new Phaser.Game(config);