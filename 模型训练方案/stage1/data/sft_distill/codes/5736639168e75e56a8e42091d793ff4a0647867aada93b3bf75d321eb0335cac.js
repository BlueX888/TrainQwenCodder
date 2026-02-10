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
let activeObjects = 0;

function preload() {
  // 使用 Graphics 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('greenBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const objectsGroup = this.physics.add.group({
    key: 'greenBall',
    repeat: 19, // 创建 20 个对象（0-19）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  const speed = 360;
  objectsGroup.children.iterate((child) => {
    // 随机位置
    child.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 随机方向，但保持总速度为 360
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    child.setVelocity(vx, vy);
    
    // 设置完全反弹
    child.setBounce(1, 1);
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, onCollision, null, this);

  // 更新活动对象数量
  activeObjects = objectsGroup.getLength();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 存储组引用以便在 update 中使用
  this.objectsGroup = objectsGroup;
}

function update() {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText([
      `Active Objects: ${activeObjects}`,
      `Total Collisions: ${collisionCount}`,
      `Speed: 360 px/s`
    ]);
  }

  // 确保物体速度保持在 360 左右（处理浮点误差）
  this.objectsGroup.children.iterate((child) => {
    const velocity = child.body.velocity;
    const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 如果速度偏差超过 1%，进行修正
    if (Math.abs(currentSpeed - 360) > 3.6) {
      const scale = 360 / currentSpeed;
      child.setVelocity(velocity.x * scale, velocity.y * scale);
    }
  });
}

function onCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

// 启动游戏
new Phaser.Game(config);