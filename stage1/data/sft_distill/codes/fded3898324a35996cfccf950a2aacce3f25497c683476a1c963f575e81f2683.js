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
let dashCount = 0; // 冲刺次数（可验证状态）
let canDash = true; // 是否可以冲刺
let isDashing = false; // 是否正在冲刺
let dashTimer;
let statusText;
let cooldownText;

const DASH_SPEED = 200 * 3; // 冲刺速度 600
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 1000; // 冷却时间 1 秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建青色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.95);

  // 添加状态显示文本
  statusText = this.add.text(16, 16, 'Dash Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  cooldownText = this.add.text(16, 46, 'Status: Ready', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  // 添加提示文本
  this.add.text(16, 76, 'Click mouse to dash', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });

  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      performDash.call(this, pointer);
    }
  });

  // 键盘控制（用于移动角色到不同位置测试冲刺）
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 基础移动控制（非冲刺状态）
  if (!isDashing) {
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(speed);
    }
  }

  // 更新状态显示
  statusText.setText('Dash Count: ' + dashCount);
  
  if (!canDash) {
    cooldownText.setText('Status: Cooling down...');
    cooldownText.setColor('#ff0000');
  } else if (isDashing) {
    cooldownText.setText('Status: Dashing!');
    cooldownText.setColor('#ffff00');
  } else {
    cooldownText.setText('Status: Ready');
    cooldownText.setColor('#00ff00');
  }
}

function performDash(pointer) {
  // 检查是否可以冲刺
  if (!canDash || isDashing) {
    return;
  }

  // 计算冲刺方向（从玩家到鼠标点击位置）
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果点击位置太近，不执行冲刺
  if (distance < 10) {
    return;
  }

  // 归一化方向向量
  const dirX = dx / distance;
  const dirY = dy / distance;

  // 设置冲刺速度
  player.setVelocity(dirX * DASH_SPEED, dirY * DASH_SPEED);

  // 更新状态
  isDashing = true;
  canDash = false;
  dashCount++;

  // 冲刺持续时间结束后停止冲刺
  this.time.delayedCall(DASH_DURATION, () => {
    isDashing = false;
    player.setVelocity(0, 0);
  });

  // 冷却计时器
  dashTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
    },
    callbackScope: this
  });
}

new Phaser.Game(config);