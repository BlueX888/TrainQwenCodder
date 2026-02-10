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

// 状态信号变量
let collisionCount = 0;
let objectCount = 12;
let movementSpeed = 160;

function preload() {
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('redCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const redObjects = this.physics.add.group({
    key: 'redCircle',
    repeat: objectCount - 1,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和随机速度
  redObjects.children.iterate((object) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);

    // 设置圆形碰撞体
    object.setCircle(16);

    // 生成随机角度，然后根据速度160计算x和y方向的速度分量
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * movementSpeed;
    const vy = Math.sin(angle) * movementSpeed;
    object.setVelocity(vx, vy);
  });

  // 添加物体间的碰撞检测
  this.physics.add.collider(redObjects, redObjects, handleCollision, null, this);

  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 更新状态文本
  this.events.on('update', () => {
    statusText.setText([
      `Objects: ${objectCount}`,
      `Speed: ${movementSpeed}`,
      `Collisions: ${collisionCount}`
    ]);
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

function update(time, delta) {
  // 每帧更新逻辑（当前不需要额外逻辑）
}

// 启动游戏
new Phaser.Game(config);