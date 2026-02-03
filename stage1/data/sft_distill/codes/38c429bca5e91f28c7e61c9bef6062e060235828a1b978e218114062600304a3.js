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

let objects = [];
let cursors;
let totalDistance = 0; // 可验证的状态信号：总移动距离
let movementCount = 0; // 移动次数统计
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1); // 蓝色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('blueBox', 32, 32);
  graphics.destroy();

  // 创建 15 个蓝色对象，随机分布
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const obj = this.physics.add.sprite(x, y, 'blueBox');
    obj.setCollideWorldBounds(true); // 限制在世界边界内
    objects.push(obj);
  }

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();
}

function update(time, delta) {
  // 重置所有对象速度
  objects.forEach(obj => {
    obj.setVelocity(0, 0);
  });

  let isMoving = false;
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    velocityX = -160;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = 160;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -160;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = 160;
    isMoving = true;
  }

  // 同步设置所有对象的速度
  if (isMoving) {
    objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 计算移动距离（基于 delta 时间和速度）
    const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
    totalDistance += distance;
    movementCount++;

    updateStatusText();
  }
}

function updateStatusText() {
  statusText.setText([
    `Objects: ${objects.length}`,
    `Total Distance: ${totalDistance.toFixed(2)}`,
    `Movement Count: ${movementCount}`,
    `Speed: 160`,
    '',
    'Use Arrow Keys to Move'
  ]);
}

new Phaser.Game(config);