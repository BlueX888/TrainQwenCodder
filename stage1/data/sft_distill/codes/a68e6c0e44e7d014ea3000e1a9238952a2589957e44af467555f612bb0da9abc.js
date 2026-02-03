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

let player;
let cursors;
let spaceKey;
let isDashing = false;
let canDash = true;
let dashCooldownTimer = null;
let normalSpeed = 200;
let dashSpeed = 900; // 300 * 3
let dashDuration = 200; // 冲刺持续时间（毫秒）
let dashCooldown = 3000; // 冷却时间3秒
let statusText;
let cooldownText;
let dashCount = 0; // 可验证的状态变量

function preload() {
  // 创建红色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 监听空格键按下事件
  spaceKey.on('down', () => {
    if (canDash && !isDashing) {
      performDash.call(this);
    }
  });
  
  // 创建状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  cooldownText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#ffff00'
  });
  
  // 说明文本
  this.add.text(16, 550, '方向键移动 | 空格键冲刺 (冷却3秒)', {
    fontSize: '16px',
    fill: '#00ff00'
  });
  
  updateStatusText();
}

function update(time, delta) {
  // 只有非冲刺状态才能用方向键控制
  if (!isDashing) {
    player.setVelocity(0);
    
    if (cursors.left.isDown) {
      player.setVelocityX(-normalSpeed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(normalSpeed);
    }
    
    if (cursors.up.isDown) {
      player.setVelocityY(-normalSpeed);
    } else if (cursors.down.isDown) {
      player.setVelocityY(normalSpeed);
    }
  }
  
  updateStatusText();
}

function performDash() {
  isDashing = true;
  canDash = false;
  dashCount++; // 增加冲刺计数
  
  // 获取当前移动方向，如果没有移动则向右冲刺
  let dashVelocityX = 0;
  let dashVelocityY = 0;
  
  if (cursors.left.isDown) {
    dashVelocityX = -dashSpeed;
  } else if (cursors.right.isDown) {
    dashVelocityX = dashSpeed;
  } else if (cursors.up.isDown) {
    dashVelocityY = -dashSpeed;
  } else if (cursors.down.isDown) {
    dashVelocityY = dashSpeed;
  } else {
    // 默认向右冲刺
    dashVelocityX = dashSpeed;
  }
  
  // 设置冲刺速度
  player.setVelocity(dashVelocityX, dashVelocityY);
  
  // 改变颜色表示冲刺状态
  player.setTint(0xffffff);
  
  // 冲刺持续时间结束后恢复
  this.time.delayedCall(dashDuration, () => {
    isDashing = false;
    player.setVelocity(0);
    player.clearTint();
  });
  
  // 开始冷却计时
  dashCooldownTimer = this.time.addEvent({
    delay: dashCooldown,
    callback: () => {
      canDash = true;
      dashCooldownTimer = null;
    }
  });
}

function updateStatusText() {
  const dashStatus = isDashing ? '冲刺中!' : '正常';
  const cooldownStatus = canDash ? '就绪' : '冷却中';
  
  statusText.setText([
    `状态: ${dashStatus}`,
    `冲刺: ${cooldownStatus}`,
    `冲刺次数: ${dashCount}`
  ]);
  
  // 显示冷却剩余时间
  if (!canDash && dashCooldownTimer) {
    const remaining = (dashCooldownTimer.delay - dashCooldownTimer.elapsed) / 1000;
    cooldownText.setText(`冷却剩余: ${remaining.toFixed(1)}秒`);
  } else {
    cooldownText.setText('');
  }
}

new Phaser.Game(config);