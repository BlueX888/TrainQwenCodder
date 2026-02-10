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

// 状态变量
let player;
let cursors;
let isDashing = false;
let canDash = true;
let dashCount = 0; // 可验证的状态信号
let statusText;

const NORMAL_SPEED = 200;
const DASH_SPEED = 300 * 3; // 900
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 500; // 冷却时间（毫秒）

function preload() {
  // 创建白色角色纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建冲刺效果纹理（半透明白色）
  const dashGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  dashGraphics.fillStyle(0xffffff, 0.3);
  dashGraphics.fillCircle(16, 16, 16);
  dashGraphics.generateTexture('dashEffect', 32, 32);
  dashGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 鼠标右键监听
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      performDash.call(this, pointer);
    }
  });

  // 状态文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 说明文本
  this.add.text(10, 550, '方向键移动 | 鼠标右键冲刺（冷却0.5秒）', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  updateStatusText();
}

function update() {
  if (!isDashing) {
    // 正常移动
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
      velocityX = -NORMAL_SPEED;
    } else if (cursors.right.isDown) {
      velocityX = NORMAL_SPEED;
    }

    if (cursors.up.isDown) {
      velocityY = -NORMAL_SPEED;
    } else if (cursors.down.isDown) {
      velocityY = NORMAL_SPEED;
    }

    player.setVelocity(velocityX, velocityY);
  }

  updateStatusText();
}

function performDash(pointer) {
  if (!canDash || isDashing) {
    return;
  }

  // 计算冲刺方向（从玩家到鼠标位置）
  const dx = pointer.worldX - player.x;
  const dy = pointer.worldY - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return;

  // 归一化方向
  const dirX = dx / distance;
  const dirY = dy / distance;

  // 开始冲刺
  isDashing = true;
  canDash = false;
  dashCount++;

  // 施加冲刺速度
  player.setVelocity(dirX * DASH_SPEED, dirY * DASH_SPEED);

  // 视觉反馈：改变透明度
  player.setAlpha(0.7);

  // 创建残影效果
  createDashTrail.call(this, player.x, player.y);

  // 冲刺持续时间结束
  this.time.addEvent({
    delay: DASH_DURATION,
    callback: () => {
      isDashing = false;
      player.setVelocity(0, 0);
      player.setAlpha(1);
    }
  });

  // 冷却时间
  this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
    }
  });
}

function createDashTrail(x, y) {
  const trail = this.add.sprite(x, y, 'dashEffect');
  trail.setAlpha(0.5);

  // 残影淡出并销毁
  this.tweens.add({
    targets: trail,
    alpha: 0,
    duration: 300,
    onComplete: () => {
      trail.destroy();
    }
  });
}

function updateStatusText() {
  const cooldownStatus = canDash ? '就绪' : '冷却中';
  const dashStatus = isDashing ? '冲刺中' : '正常';
  
  statusText.setText([
    `冲刺次数: ${dashCount}`,
    `状态: ${dashStatus}`,
    `冷却: ${cooldownStatus}`,
    `位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

new Phaser.Game(config);