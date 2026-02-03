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
let crossCount = 0; // 可验证的状态信号：记录穿越边界次数
let scoreText;

function preload() {
  // 使用Graphics创建蓝色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('playerBlue', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建蓝色玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerBlue');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出屏幕
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示穿越次数的文本
  scoreText = this.add.text(16, 16, 'Cross Count: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });
  
  // 添加说明文本
  this.add.text(16, 50, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#aaaaaa'
  });
  
  // 显示边界提示
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xff0000, 0.5);
  graphics.strokeRect(0, 0, config.width, config.height);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入，设置移动速度为120
  if (cursors.left.isDown) {
    player.setVelocityX(-120);
  } else if (cursors.right.isDown) {
    player.setVelocityX(120);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-120);
  } else if (cursors.down.isDown) {
    player.setVelocityY(120);
  }
  
  // 处理对角线移动时的速度标准化
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      player.body.velocity.normalize().scale(120);
    }
  }
  
  // 循环地图效果：检测边界并从对侧出现
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  // 左右边界循环
  if (player.x < -halfWidth) {
    player.x = config.width + halfWidth;
    crossCount++;
    updateScoreText();
  } else if (player.x > config.width + halfWidth) {
    player.x = -halfWidth;
    crossCount++;
    updateScoreText();
  }
  
  // 上下边界循环
  if (player.y < -halfHeight) {
    player.y = config.height + halfHeight;
    crossCount++;
    updateScoreText();
  } else if (player.y > config.height + halfHeight) {
    player.y = -halfHeight;
    crossCount++;
    updateScoreText();
  }
}

function updateScoreText() {
  scoreText.setText('Cross Count: ' + crossCount);
}

new Phaser.Game(config);