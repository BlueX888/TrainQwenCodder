const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

// 状态变量
let players = [];
let cursors;
let totalDistance = 0; // 可验证的状态信号：总移动距离
let statusText;

function preload() {
  // 使用 Graphics 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00FFFF, 1); // 青色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('cyanBlock', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建3个青色对象，分别放置在不同位置
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];

  positions.forEach((pos, index) => {
    const player = this.physics.add.sprite(pos.x, pos.y, 'cyanBlock');
    player.setCollideWorldBounds(true); // 限制在世界边界内
    players.push(player);
  });

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态显示文本
  statusText = this.add.text(16, 16, 'Total Distance: 0', {
    fontSize: '20px',
    fill: '#00FFFF',
    fontFamily: 'Arial'
  });

  // 添加说明文本
  this.add.text(16, 50, 'Use Arrow Keys to move all objects', {
    fontSize: '16px',
    fill: '#FFFFFF',
    fontFamily: 'Arial'
  });
}

function update(time, delta) {
  const speed = 240;
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -speed;
  } else if (cursors.right.isDown) {
    velocityX = speed;
  }

  if (cursors.up.isDown) {
    velocityY = -speed;
  } else if (cursors.down.isDown) {
    velocityY = speed;
  }

  // 同步设置所有对象的速度
  players.forEach(player => {
    player.setVelocity(velocityX, velocityY);
  });

  // 计算移动距离（仅当有移动时）
  if (velocityX !== 0 || velocityY !== 0) {
    const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * delta / 1000;
    totalDistance += distance;
    statusText.setText(`Total Distance: ${Math.floor(totalDistance)}`);
  }
}

new Phaser.Game(config);