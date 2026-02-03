const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态信号变量
let dashCount = 0; // 冲刺次数
let canDash = true; // 是否可以冲刺
let cooldownRemaining = 0; // 剩余冷却时间

let player;
let statusText;
let cooldownText;
let dashCooldownTimer = null;

const DASH_SPEED = 200 * 3; // 冲刺速度 600
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 1000; // 冷却时间1秒

function preload() {
  // 创建青色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建冷却指示器纹理
  const cooldownGraphics = this.add.graphics();
  cooldownGraphics.fillStyle(0xff0000, 0.3);
  cooldownGraphics.fillCircle(16, 16, 20);
  cooldownGraphics.generateTexture('cooldown', 40, 40);
  cooldownGraphics.destroy();
}

function create() {
  // 创建玩家角色
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.95); // 添加阻力使角色逐渐停止

  // 创建冷却指示器（初始隐藏）
  const cooldownIndicator = this.add.sprite(400, 300, 'cooldown');
  cooldownIndicator.setVisible(false);
  cooldownIndicator.setDepth(-1);

  // 状态文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#00ffff',
    fontFamily: 'Arial'
  });

  cooldownText = this.add.text(10, 40, '', {
    fontSize: '16px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  });

  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown() && canDash) {
      performDash.call(this, pointer);
    }
  });

  // 更新状态显示
  updateStatusDisplay();
}

function performDash(pointer) {
  // 计算冲刺方向
  const angle = Phaser.Math.Angle.Between(
    player.x,
    player.y,
    pointer.x,
    pointer.y
  );

  // 计算冲刺速度分量
  const velocityX = Math.cos(angle) * DASH_SPEED;
  const velocityY = Math.sin(angle) * DASH_SPEED;

  // 施加冲刺速度
  player.setVelocity(velocityX, velocityY);

  // 增加冲刺次数
  dashCount++;

  // 进入冷却状态
  canDash = false;
  cooldownRemaining = DASH_COOLDOWN;

  // 短暂冲刺后恢复正常移动
  this.time.delayedCall(DASH_DURATION, () => {
    // 减速但不完全停止，让玩家保持一定惯性
    player.setVelocity(
      player.body.velocity.x * 0.3,
      player.body.velocity.y * 0.3
    );
  });

  // 设置冷却计时器
  if (dashCooldownTimer) {
    dashCooldownTimer.destroy();
  }

  dashCooldownTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      cooldownRemaining = 0;
      updateStatusDisplay();
    },
    callbackScope: this
  });

  updateStatusDisplay();
}

function update(time, delta) {
  // 更新冷却时间显示
  if (!canDash && dashCooldownTimer) {
    cooldownRemaining = Math.max(0, dashCooldownTimer.getRemaining());
    updateStatusDisplay();
  }

  // 限制最大速度（防止速度过快）
  const maxSpeed = DASH_SPEED;
  const currentSpeed = Math.sqrt(
    player.body.velocity.x ** 2 + player.body.velocity.y ** 2
  );
  
  if (currentSpeed > maxSpeed) {
    const scale = maxSpeed / currentSpeed;
    player.setVelocity(
      player.body.velocity.x * scale,
      player.body.velocity.y * scale
    );
  }
}

function updateStatusDisplay() {
  statusText.setText([
    `冲刺次数: ${dashCount}`,
    `状态: ${canDash ? '就绪 ✓' : '冷却中...'}`,
    `当前速度: ${Math.round(Math.sqrt(player.body.velocity.x ** 2 + player.body.velocity.y ** 2))}`
  ]);

  if (!canDash) {
    cooldownText.setText(
      `冷却剩余: ${(cooldownRemaining / 1000).toFixed(2)}秒`
    );
    cooldownText.setVisible(true);
  } else {
    cooldownText.setText('点击鼠标左键冲刺！');
    cooldownText.setFill('#00ff00');
  }
}

new Phaser.Game(config);