const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态信号变量
let currentState = 'idle';
let stateChangeCount = 0;
let totalRunTime = 0;
let totalIdleTime = 0;

function preload() {
  // 创建青色角色纹理 - idle 状态（圆形）
  const idleGraphics = this.add.graphics();
  idleGraphics.fillStyle(0x00FFFF, 1);
  idleGraphics.fillCircle(32, 32, 30);
  idleGraphics.fillStyle(0xFFFFFF, 1);
  idleGraphics.fillCircle(20, 25, 5); // 左眼
  idleGraphics.fillCircle(44, 25, 5); // 右眼
  idleGraphics.fillStyle(0x00CCCC, 1);
  idleGraphics.fillCircle(32, 45, 8); // 嘴巴
  idleGraphics.generateTexture('player_idle', 64, 64);
  idleGraphics.destroy();

  // 创建青色角色纹理 - run 状态（椭圆形，更有动感）
  const runGraphics = this.add.graphics();
  runGraphics.fillStyle(0x00FFFF, 1);
  runGraphics.fillEllipse(32, 32, 50, 40);
  runGraphics.fillStyle(0xFFFFFF, 1);
  runGraphics.fillCircle(25, 28, 5); // 左眼
  runGraphics.fillCircle(45, 28, 5); // 右眼
  runGraphics.fillStyle(0x00CCCC, 1);
  runGraphics.fillEllipse(32, 42, 12, 6); // 张开的嘴
  // 添加运动线条
  runGraphics.lineStyle(3, 0x00CCCC, 0.7);
  runGraphics.lineBetween(5, 20, 15, 25);
  runGraphics.lineBetween(5, 35, 15, 38);
  runGraphics.generateTexture('player_run', 64, 64);
  runGraphics.destroy();
}

function create() {
  // 创建角色精灵
  this.player = this.add.sprite(400, 300, 'player_idle');
  this.player.setScale(2);

  // 状态文本显示
  this.stateText = this.add.text(400, 100, 'State: IDLE', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00FFFF',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);

  // 统计信息文本
  this.statsText = this.add.text(20, 20, '', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#FFFFFF'
  });

  // 提示文本
  this.add.text(400, 550, 'Press SPACE to toggle | Arrow Keys to move in RUN state', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#AAAAAA'
  }).setOrigin(0.5);

  // 键盘输入设置
  this.cursors = this.input.keyboard.createCursorKeys();
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 空格键切换状态
  this.spaceKey.on('down', () => {
    this.switchState();
  });

  // 初始化时间追踪
  this.stateStartTime = this.time.now;

  // 启动 idle 动画
  this.startIdleAnimation();
}

function update(time, delta) {
  // 更新状态时间统计
  const elapsedSeconds = (time - this.stateStartTime) / 1000;
  if (currentState === 'idle') {
    totalIdleTime = elapsedSeconds;
  } else {
    totalRunTime = elapsedSeconds;
  }

  // 更新统计文本
  this.statsText.setText([
    `State Changes: ${stateChangeCount}`,
    `Current State Time: ${elapsedSeconds.toFixed(1)}s`,
    `Total Idle Time: ${totalIdleTime.toFixed(1)}s`,
    `Total Run Time: ${totalRunTime.toFixed(1)}s`
  ]);

  // run 状态下的方向键移动
  if (currentState === 'run') {
    const speed = 5;
    let moved = false;

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
      this.player.setFlipX(true);
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
      this.player.setFlipX(false);
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
      moved = true;
    }

    // 边界检查
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
    this.player.y = Phaser.Math.Clamp(this.player.y, 150, 500);

    // 如果在移动，增加旋转效果
    if (moved && !this.player.getData('rotating')) {
      this.player.setData('rotating', true);
      this.tweens.add({
        targets: this.player,
        angle: this.player.angle + 360,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          this.player.setData('rotating', false);
          this.player.angle = 0;
        }
      });
    }
  }
}

// 切换状态函数
function switchState() {
  // 停止所有当前 tween
  this.tweens.killTweensOf(this.player);
  
  if (currentState === 'idle') {
    // 切换到 run 状态
    currentState = 'run';
    this.player.setTexture('player_run');
    this.stateText.setText('State: RUN');
    this.stateText.setColor('#FFFF00');
    this.startRunAnimation();
  } else {
    // 切换到 idle 状态
    currentState = 'idle';
    this.player.setTexture('player_idle');
    this.player.setFlipX(false);
    this.player.angle = 0;
    this.stateText.setText('State: IDLE');
    this.stateText.setColor('#00FFFF');
    this.startIdleAnimation();
  }

  stateChangeCount++;
  this.stateStartTime = this.time.now;
}

// idle 状态动画 - 呼吸效果
function startIdleAnimation() {
  this.tweens.add({
    targets: this.player,
    scaleX: 2.2,
    scaleY: 2.2,
    duration: 1500,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });

  // 轻微上下浮动
  this.tweens.add({
    targets: this.player,
    y: this.player.y - 10,
    duration: 2000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
}

// run 状态动画 - 快速脉冲效果
function startRunAnimation() {
  this.tweens.add({
    targets: this.player,
    scaleX: 2.3,
    scaleY: 1.8,
    duration: 300,
    ease: 'Power2',
    yoyo: true,
    repeat: -1
  });

  // 添加发光效果（通过快速缩放模拟）
  this.tweens.add({
    targets: this.player,
    alpha: 0.7,
    duration: 200,
    ease: 'Linear',
    yoyo: true,
    repeat: -1
  });
}

new Phaser.Game(config);