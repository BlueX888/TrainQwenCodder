const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量（用于验证）
let currentState = 'idle';
let stateChangeCount = 0;

function preload() {
  // 使用 Graphics 创建红色角色的多帧纹理
  const graphics = this.add.graphics();
  
  // 创建 idle 状态的纹理（单帧，纯红色方块）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 64, 64);
  graphics.generateTexture('player_idle', 64, 64);
  graphics.clear();
  
  // 创建 run 状态的纹理帧（4帧，不同亮度的红色表示动画）
  const runColors = [0xff0000, 0xcc0000, 0xff3333, 0xee0000];
  for (let i = 0; i < 4; i++) {
    graphics.fillStyle(runColors[i], 1);
    graphics.fillRect(0, 0, 64, 64);
    // 添加简单的腿部动画效果
    graphics.fillStyle(0x880000, 1);
    if (i % 2 === 0) {
      graphics.fillRect(10, 50, 15, 14);
      graphics.fillRect(40, 50, 15, 14);
    } else {
      graphics.fillRect(15, 50, 15, 14);
      graphics.fillRect(35, 50, 15, 14);
    }
    graphics.generateTexture(`player_run_${i}`, 64, 64);
    graphics.clear();
  }
  
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  this.player = this.add.sprite(400, 300, 'player_idle');
  this.player.setOrigin(0.5);
  
  // 创建 run 动画（帧动画）
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'player_run_0' },
      { key: 'player_run_1' },
      { key: 'player_run_2' },
      { key: 'player_run_3' }
    ],
    frameRate: 8,
    repeat: -1
  });
  
  // 状态显示文本
  this.stateText = this.add.text(400, 100, 'State: IDLE', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  this.stateText.setOrigin(0.5);
  
  // 指令文本
  this.add.text(400, 150, 'Press [I] for IDLE | Press [R] for RUN', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 状态计数器文本（用于验证）
  this.counterText = this.add.text(400, 500, 'State Changes: 0', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffff00'
  });
  this.counterText.setOrigin(0.5);
  
  // 添加按键监听
  this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  
  // 初始化为 idle 状态
  this.currentTween = null;
  this.switchToIdle();
}

function update() {
  // 检测按键切换状态
  if (Phaser.Input.Keyboard.JustDown(this.keyI)) {
    this.switchToIdle();
  }
  
  if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
    this.switchToRun();
  }
}

// 切换到 idle 状态
Phaser.Scene.prototype.switchToIdle = function() {
  if (currentState === 'idle') return;
  
  currentState = 'idle';
  stateChangeCount++;
  
  // 停止 run 动画
  this.player.stop();
  this.player.setTexture('player_idle');
  
  // 停止之前的 tween
  if (this.currentTween) {
    this.currentTween.stop();
  }
  
  // 创建 idle 状态的上下浮动 tween
  this.currentTween = this.tweens.add({
    targets: this.player,
    y: 280,
    duration: 1500,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
  
  // 更新显示
  this.stateText.setText('State: IDLE');
  this.stateText.setColor('#00ff00');
  this.counterText.setText(`State Changes: ${stateChangeCount}`);
};

// 切换到 run 状态
Phaser.Scene.prototype.switchToRun = function() {
  if (currentState === 'run') return;
  
  currentState = 'run';
  stateChangeCount++;
  
  // 停止 idle tween
  if (this.currentTween) {
    this.currentTween.stop();
  }
  
  // 重置位置
  this.player.y = 300;
  
  // 播放 run 帧动画
  this.player.play('run');
  
  // 添加水平移动 tween（跑步效果）
  this.currentTween = this.tweens.add({
    targets: this.player,
    x: 600,
    duration: 2000,
    ease: 'Linear',
    yoyo: true,
    repeat: -1
  });
  
  // 更新显示
  this.stateText.setText('State: RUN');
  this.stateText.setColor('#ff6600');
  this.counterText.setText(`State Changes: ${stateChangeCount}`);
};

new Phaser.Game(config);