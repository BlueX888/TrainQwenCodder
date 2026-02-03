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

let player;
let currentState = 'idle';
let stateText;
let idleTween;
let runTween;

function preload() {
  // 程序化生成角色纹理帧
  generateCharacterFrames(this);
}

function create() {
  // 创建角色精灵
  player = this.add.sprite(400, 300, 'idle_0');
  player.setScale(2);

  // 创建 idle 动画（4帧，轻微形变）
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'idle_0' },
      { key: 'idle_1' },
      { key: 'idle_2' },
      { key: 'idle_1' }
    ],
    frameRate: 4,
    repeat: -1
  });

  // 创建 run 动画（4帧，跑步动作）
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'run_0' },
      { key: 'run_1' },
      { key: 'run_2' },
      { key: 'run_3' }
    ],
    frameRate: 8,
    repeat: -1
  });

  // 默认播放 idle 动画
  player.play('idle');

  // 创建 idle 状态的浮动 tween
  idleTween = this.tweens.add({
    targets: player,
    y: 280,
    duration: 1000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
    paused: false
  });

  // 创建 run 状态的抖动 tween（初始暂停）
  runTween = this.tweens.add({
    targets: player,
    x: 420,
    duration: 150,
    ease: 'Linear',
    yoyo: true,
    repeat: -1,
    paused: true
  });

  // 状态显示文本
  stateText = this.add.text(400, 50, 'State: IDLE', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  stateText.setOrigin(0.5);

  // 提示文本
  this.add.text(400, 550, 'Press SPACE for IDLE | Press ARROW KEYS for RUN', {
    fontSize: '20px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 键盘输入
  this.cursors = this.input.keyboard.createCursorKeys();
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 监听空格键按下
  this.spaceKey.on('down', () => {
    switchState(this, 'idle');
  });
}

function update() {
  // 检测方向键
  if (this.cursors.left.isDown || this.cursors.right.isDown || 
      this.cursors.up.isDown || this.cursors.down.isDown) {
    if (currentState !== 'run') {
      switchState(this, 'run');
    }
  }
}

function switchState(scene, newState) {
  if (currentState === newState) return;

  currentState = newState;

  if (newState === 'idle') {
    // 切换到 idle
    player.play('idle');
    stateText.setText('State: IDLE');
    stateText.setColor('#00ff00');

    // 停止 run tween，启动 idle tween
    runTween.pause();
    player.x = 400; // 重置位置
    idleTween.resume();

  } else if (newState === 'run') {
    // 切换到 run
    player.play('run');
    stateText.setText('State: RUN');
    stateText.setColor('#ff9900');

    // 停止 idle tween，启动 run tween
    idleTween.pause();
    player.y = 300; // 重置位置
    runTween.resume();
  }
}

function generateCharacterFrames(scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

  // 生成 idle 帧（4帧，轻微变化）
  for (let i = 0; i < 4; i++) {
    graphics.clear();
    
    // 白色身体（矩形，高度略有变化）
    const bodyHeight = 40 + Math.sin(i * Math.PI / 2) * 4;
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(16, 32 - bodyHeight / 2, 32, bodyHeight);
    
    // 白色头部（圆形）
    graphics.fillCircle(32, 16, 12);
    
    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(28, 14, 2);
    graphics.fillCircle(36, 14, 2);
    
    // 手臂（轻微摆动）
    graphics.fillStyle(0xffffff, 1);
    const armOffset = Math.sin(i * Math.PI / 2) * 2;
    graphics.fillRect(10, 30 + armOffset, 6, 16);
    graphics.fillRect(48, 30 - armOffset, 6, 16);
    
    // 腿部
    graphics.fillRect(20, 50, 8, 18);
    graphics.fillRect(36, 50, 8, 18);

    graphics.generateTexture(`idle_${i}`, 64, 68);
  }

  // 生成 run 帧（4帧，跑步动作）
  for (let i = 0; i < 4; i++) {
    graphics.clear();
    
    // 身体（略微前倾）
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(18, 24, 28, 36);
    
    // 头部
    graphics.fillCircle(32, 16, 12);
    
    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(28, 14, 2);
    graphics.fillCircle(36, 14, 2);
    
    // 手臂（大幅摆动）
    graphics.fillStyle(0xffffff, 1);
    const armSwing = i % 2 === 0 ? 1 : -1;
    graphics.fillRect(8, 28 + armSwing * 8, 6, 20);
    graphics.fillRect(50, 28 - armSwing * 8, 6, 20);
    
    // 腿部（跑步姿态）
    const legPhase = (i % 4) * Math.PI / 2;
    const leg1Y = 48 + Math.sin(legPhase) * 6;
    const leg2Y = 48 - Math.sin(legPhase) * 6;
    graphics.fillRect(20, leg1Y, 8, 20);
    graphics.fillRect(36, leg2Y, 8, 20);

    graphics.generateTexture(`run_${i}`, 64, 68);
  }

  graphics.destroy();
}

new Phaser.Game(config);