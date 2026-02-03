// 完整的 Phaser3 代码
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

// 全局变量
let objects = [];
let cursors;
let totalDistance = 0; // 可验证的状态信号
let statusText;

function preload() {
  // 使用 Graphics 生成蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('blueBox', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建15个蓝色对象，排列成3行5列
  const rows = 3;
  const cols = 5;
  const startX = 200;
  const startY = 150;
  const spacingX = 100;
  const spacingY = 120;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      // 创建物理精灵
      const obj = this.physics.add.sprite(x, y, 'blueBox');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      objects.push(obj);
    }
  }

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态显示文本
  statusText = this.add.text(16, 16, 'Total Distance: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setScrollFactor(0);
  statusText.setDepth(100);

  // 添加说明文本
  this.add.text(16, 550, 'Use Arrow Keys to move all objects', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  const speed = 160;
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -speed;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = speed;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -speed;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = speed;
    isMoving = true;
  }

  // 同步控制所有对象移动
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });

  // 更新移动距离统计
  if (isMoving) {
    const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
    totalDistance += distance;
    statusText.setText(`Total Distance: ${Math.floor(totalDistance)}`);
  }
}

// 启动游戏
new Phaser.Game(config);