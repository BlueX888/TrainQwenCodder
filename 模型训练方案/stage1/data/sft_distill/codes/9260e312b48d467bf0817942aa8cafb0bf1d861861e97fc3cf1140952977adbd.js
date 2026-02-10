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

// 游戏状态变量（可验证信号）
let gameState = {
  currentState: 'idle',
  idleCount: 0,
  runCount: 0,
  totalSwitches: 0
};

let player;
let stateText;
let statsText;
let currentTween = null;

function preload() {
  // 创建 idle 状态的帧纹理（3帧，粉色角色呼吸效果）
  for (let i = 0; i < 3; i++) {
    const graphics = this.add.graphics();
    
    // 身体（粉色方块，大小随帧变化）
    const scale = 1 + (i * 0.05);
    graphics.fillStyle(0xff69b4, 1);
    graphics.fillRoundedRect(-25 * scale, -30 * scale, 50 * scale, 60 * scale, 8);
    
    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(-12, -10, 4);
    graphics.fillCircle(12, -10, 4);
    
    // 嘴巴（微笑）
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginPath();
    graphics.arc(0, 5, 10, 0, Math.PI, false);
    graphics.strokePath();
    
    graphics.generateTexture(`idle_frame_${i}`, 80, 80);
    graphics.destroy();
  }
  
  // 创建 run 状态的帧纹理（4帧，跑步动作）
  for (let i = 0; i < 4; i++) {
    const graphics = this.add.graphics();
    
    // 身体倾斜效果
    const angle = Math.sin(i * Math.PI / 2) * 10;
    const offsetY = Math.abs(Math.sin(i * Math.PI / 2)) * 5;
    
    graphics.save();
    graphics.translateCanvas(40, 40);
    graphics.rotateCanvas(angle * Math.PI / 180);
    
    // 身体
    graphics.fillStyle(0xff1493, 1); // 更深的粉色
    graphics.fillRoundedRect(-25, -30 + offsetY, 50, 60, 8);
    
    // 眼睛（更有神）
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(-12, -10 + offsetY, 5);
    graphics.fillCircle(12, -10 + offsetY, 5);
    
    // 嘴巴（张开）
    graphics.fillStyle(0x000000, 0.8);
    graphics.fillEllipse(0, 5 + offsetY, 8, 10);
    
    // 运动线条
    graphics.lineStyle(3, 0xff69b4, 0.5);
    graphics.lineBetween(-40, 0, -30, 0);
    graphics.lineBetween(-40, 10, -28, 10);
    
    graphics.restore();
    
    graphics.generateTexture(`run_frame_${i}`, 80, 80);
    graphics.destroy();
  }
}

function create() {
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'idle_frame_0');
  player.setScale(2);
  
  // 创建 idle 动画
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'idle_frame_0' },
      { key: 'idle_frame_1' },
      { key: 'idle_frame_2' },
      { key: 'idle_frame_1' }
    ],
    frameRate: 4,
    repeat: -1
  });
  
  // 创建 run 动画
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'run_frame_0' },
      { key: 'run_frame_1' },
      { key: 'run_frame_2' },
      { key: 'run_frame_3' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  // 播放初始动画
  player.play('idle');
  
  // 创建状态显示文本
  stateText = this.add.text(400, 100, 'State: IDLE', {
    fontSize: '32px',
    fill: '#ff69b4',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建统计文本
  statsText = this.add.text(400, 500, '', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setOrigin(0.5);
  
  updateStatsText();
  
  // 添加说明文本
  this.add.text(400, 550, 'Press SPACE for IDLE | Press ARROW KEYS for RUN', {
    fontSize: '16px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 键盘输入监听
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  const leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
  const rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  const downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  
  // 空格键切换到 idle 状态
  spaceKey.on('down', () => {
    switchToIdle(this);
  });
  
  // 方向键切换到 run 状态
  leftKey.on('down', () => {
    switchToRun(this);
  });
  
  rightKey.on('down', () => {
    switchToRun(this);
  });
  
  upKey.on('down', () => {
    switchToRun(this);
  });
  
  downKey.on('down', () => {
    switchToRun(this);
  });
}

function update() {
  // 更新逻辑（如需要）
}

function switchToIdle(scene) {
  if (gameState.currentState === 'idle') return;
  
  gameState.currentState = 'idle';
  gameState.idleCount++;
  gameState.totalSwitches++;
  
  // 停止当前 tween
  if (currentTween) {
    currentTween.stop();
  }
  
  // 播放 idle 动画
  player.play('idle');
  
  // 添加缩放 tween（放松效果）
  currentTween = scene.tweens.add({
    targets: player,
    scaleX: 2.2,
    scaleY: 2.2,
    duration: 300,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
  
  // 更新文本
  stateText.setText('State: IDLE');
  stateText.setColor('#ff69b4');
  
  // 文本闪烁效果
  scene.tweens.add({
    targets: stateText,
    alpha: 0.5,
    duration: 150,
    yoyo: true,
    repeat: 2
  });
  
  updateStatsText();
}

function switchToRun(scene) {
  if (gameState.currentState === 'run') return;
  
  gameState.currentState = 'run';
  gameState.runCount++;
  gameState.totalSwitches++;
  
  // 停止当前 tween
  if (currentTween) {
    currentTween.stop();
  }
  
  // 播放 run 动画
  player.play('run');
  
  // 添加震动 tween（奔跑效果）
  currentTween = scene.tweens.add({
    targets: player,
    y: 295,
    duration: 100,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 更新文本
  stateText.setText('State: RUN');
  stateText.setColor('#ff1493');
  
  // 文本闪烁效果
  scene.tweens.add({
    targets: stateText,
    alpha: 0.5,
    duration: 150,
    yoyo: true,
    repeat: 2
  });
  
  updateStatsText();
}

function updateStatsText() {
  statsText.setText(
    `Total Switches: ${gameState.totalSwitches} | ` +
    `Idle: ${gameState.idleCount} | ` +
    `Run: ${gameState.runCount}`
  );
}

new Phaser.Game(config);