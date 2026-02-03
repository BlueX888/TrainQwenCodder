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

// 游戏状态变量
let player;
let cursors;
let spaceKey;
let isDashing = false;
let canDash = true;
let dashCooldown = 2500; // 2.5秒冷却
let dashDuration = 200; // 冲刺持续时间（毫秒）
let dashSpeed = 240 * 3; // 冲刺速度
let normalSpeed = 200; // 正常移动速度

// 状态信号变量（用于验证）
let dashCount = 0; // 冲刺次数统计
let cooldownRemaining = 0; // 剩余冷却时间

let statusText;
let cooldownText;

function preload() {
  // 使用 Graphics 创建黄色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建黄色角色
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 空格键按下事件
  spaceKey.on('down', () => {
    if (canDash && !isDashing) {
      startDash.call(this);
    }
  });
  
  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  cooldownText = this.add.text(16, 50, '', {
    fontSize: '18px',
    fill: '#ffff00'
  });
  
  // 添加操作提示
  this.add.text(16, 550, '方向键移动 | 空格键冲刺', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
  
  updateStatusText();
}

function update(time, delta) {
  // 非冲刺状态下的正常移动
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

function startDash() {
  isDashing = true;
  canDash = false;
  dashCount++;
  
  // 计算冲刺方向
  let dashX = 0;
  let dashY = 0;
  
  if (cursors.left.isDown) {
    dashX = -1;
  } else if (cursors.right.isDown) {
    dashX = 1;
  }
  
  if (cursors.up.isDown) {
    dashY = -1;
  } else if (cursors.down.isDown) {
    dashY = 1;
  }
  
  // 如果没有方向输入，默认向右冲刺
  if (dashX === 0 && dashY === 0) {
    dashX = 1;
  }
  
  // 归一化方向向量
  const length = Math.sqrt(dashX * dashX + dashY * dashY);
  dashX /= length;
  dashY /= length;
  
  // 设置冲刺速度
  player.setVelocity(dashX * dashSpeed, dashY * dashSpeed);
  
  // 冲刺持续时间结束
  this.time.addEvent({
    delay: dashDuration,
    callback: () => {
      isDashing = false;
      player.setVelocity(0);
    }
  });
  
  // 冷却计时器
  cooldownRemaining = dashCooldown;
  const cooldownTimer = this.time.addEvent({
    delay: 100, // 每100ms更新一次
    repeat: dashCooldown / 100 - 1,
    callback: () => {
      cooldownRemaining -= 100;
      if (cooldownRemaining <= 0) {
        canDash = true;
        cooldownRemaining = 0;
      }
    }
  });
}

function updateStatusText() {
  statusText.setText([
    `冲刺次数: ${dashCount}`,
    `冲刺状态: ${isDashing ? '冲刺中' : '正常'}`,
    `冷却状态: ${canDash ? '就绪' : '冷却中'}`
  ]);
  
  if (!canDash) {
    cooldownText.setText(`冷却剩余: ${(cooldownRemaining / 1000).toFixed(1)}秒`);
  } else {
    cooldownText.setText('冷却剩余: 0.0秒');
  }
}

new Phaser.Game(config);