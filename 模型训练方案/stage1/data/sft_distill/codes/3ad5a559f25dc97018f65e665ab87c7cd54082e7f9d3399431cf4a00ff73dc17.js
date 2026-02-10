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

// 游戏状态变量（可验证信号）
let totalDistance = 0;
let moveCount = 0;
let players = [];
let cursors;
let statusText;

function preload() {
  // 使用 Graphics 生成红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('redSquare', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建3个红色对象，分别放置在不同位置
  const player1 = this.physics.add.sprite(200, 300, 'redSquare');
  const player2 = this.physics.add.sprite(400, 300, 'redSquare');
  const player3 = this.physics.add.sprite(600, 300, 'redSquare');
  
  // 设置碰撞边界
  player1.setCollideWorldBounds(true);
  player2.setCollideWorldBounds(true);
  player3.setCollideWorldBounds(true);
  
  // 将所有对象存入数组便于统一控制
  players = [player1, player2, player3];
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  updateStatusText();
  
  // 添加说明文本
  this.add.text(16, 550, '使用方向键控制所有红色方块同步移动', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;
  
  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -200;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = 200;
    isMoving = true;
  }
  
  if (cursors.up.isDown) {
    velocityY = -200;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = 200;
    isMoving = true;
  }
  
  // 同步设置所有对象的速度
  players.forEach(player => {
    player.setVelocity(velocityX, velocityY);
  });
  
  // 更新状态变量
  if (isMoving) {
    // 计算移动距离（像素/秒 * 秒 = 像素）
    const distance = 200 * (delta / 1000);
    totalDistance += distance;
    moveCount++;
    
    // 每30帧更新一次文本（避免频繁更新）
    if (moveCount % 30 === 0) {
      updateStatusText();
    }
  }
}

function updateStatusText() {
  statusText.setText([
    `总移动距离: ${Math.floor(totalDistance)} 像素`,
    `移动帧数: ${moveCount}`,
    `对象数量: ${players.length}`
  ]);
}

// 启动游戏
new Phaser.Game(config);