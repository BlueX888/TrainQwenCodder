const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
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
let ground;
let jumpCount = 0; // 当前跳跃次数
let maxJumps = 2; // 最大跳跃次数
let jumpPower = -200; // 跳跃力度（负值向上）
let spaceKey;
let statusText;
let totalJumps = 0; // 总跳跃次数统计

function preload() {
  // 创建角色纹理
  const graphics = this.add.graphics();
  
  // 绘制玩家（绿色方块）
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  
  // 绘制地面（棕色矩形）
  graphics.clear();
  graphics.fillStyle(0x8B4513, 1);
  graphics.fillRect(0, 0, 800, 50);
  graphics.generateTexture('ground', 800, 50);
  
  graphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.staticSprite(400, 575, 'ground');
  ground.setOrigin(0.5, 0.5);
  ground.refreshBody();
  
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  
  // 添加碰撞检测
  this.physics.add.collider(player, ground, onLanding, null, this);
  
  // 添加键盘输入
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文本
  this.add.text(16, 60, '按空格键跳跃（可双跳）', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();
}

function update() {
  // 检测空格键按下（使用 justDown 避免连续触发）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    jump();
  }
  
  // 更新状态显示
  updateStatusText();
  
  // 检测是否在地面上（通过速度判断）
  if (player.body.touching.down && player.body.velocity.y === 0) {
    if (jumpCount !== 0) {
      jumpCount = 0;
      updateStatusText();
    }
  }
}

// 跳跃函数
function jump() {
  // 检查是否还能跳跃
  if (jumpCount < maxJumps) {
    player.setVelocityY(jumpPower);
    jumpCount++;
    totalJumps++;
    updateStatusText();
    
    // 视觉反馈：改变颜色
    if (jumpCount === 1) {
      player.setTint(0x00ff00); // 第一次跳跃：绿色
    } else if (jumpCount === 2) {
      player.setTint(0xffff00); // 第二次跳跃：黄色
    }
  }
}

// 落地回调
function onLanding() {
  // 重置跳跃次数
  if (jumpCount > 0) {
    jumpCount = 0;
    player.clearTint(); // 恢复原色
    updateStatusText();
  }
}

// 更新状态文本
function updateStatusText() {
  const isOnGround = player.body.touching.down && player.body.velocity.y === 0;
  const status = isOnGround ? '地面' : '空中';
  
  statusText.setText(
    `状态: ${status}\n` +
    `当前跳跃次数: ${jumpCount}/${maxJumps}\n` +
    `总跳跃次数: ${totalJumps}\n` +
    `速度Y: ${Math.round(player.body.velocity.y)}`
  );
}

// 启动游戏
new Phaser.Game(config);