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
let objects = [];
let cursors;
let totalDistance = 0; // 可验证的状态信号
let movementSpeed = 160;
let statusText;

function preload() {
  // 使用 Graphics 生成灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('grayBox', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建 5 个灰色对象，分散在不同位置
  const positions = [
    { x: 200, y: 200 },
    { x: 400, y: 150 },
    { x: 600, y: 250 },
    { x: 300, y: 400 },
    { x: 500, y: 450 }
  ];

  for (let i = 0; i < 5; i++) {
    const obj = this.physics.add.sprite(
      positions[i].x,
      positions[i].y,
      'grayBox'
    );
    obj.setCollideWorldBounds(true); // 限制在世界边界内
    objects.push(obj);
  }

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  updateStatusText();

  // 添加说明文本
  this.add.text(10, 560, '使用方向键控制所有灰色方块同步移动', {
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
    velocityX = -movementSpeed;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = movementSpeed;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -movementSpeed;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = movementSpeed;
    isMoving = true;
  }

  // 同步更新所有对象的速度
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });

  // 计算移动距离（用于状态验证）
  if (isMoving) {
    const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
    totalDistance += distance;
    updateStatusText();
  }
}

function updateStatusText() {
  statusText.setText([
    `对象数量: ${objects.length}`,
    `移动速度: ${movementSpeed}`,
    `总移动距离: ${totalDistance.toFixed(2)}`,
    `第一个对象位置: (${Math.round(objects[0].x)}, ${Math.round(objects[0].y)})`
  ]);
}

new Phaser.Game(config);