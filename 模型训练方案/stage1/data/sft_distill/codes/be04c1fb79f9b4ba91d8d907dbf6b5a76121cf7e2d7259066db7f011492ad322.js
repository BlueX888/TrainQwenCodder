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
let totalBounces = 0;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('blueCircle', 32, 32);
  graphics.destroy();

  // 创建物理组
  const blueObjects = this.physics.add.group({
    key: 'blueCircle',
    repeat: 14, // 总共 15 个（1 + 14）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 初始化活动对象计数
  activeObjects = 15;

  // 为每个物体设置随机位置和随机方向的速度（总速度为 240）
  blueObjects.children.iterate((object, index) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);

    // 随机角度，速度大小固定为 240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    object.setVelocity(velocityX, velocityY);

    // 设置反弹系数
    object.setBounce(1, 1);
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(blueObjects, blueObjects, onCollision, null, this);

  // 添加文本显示状态信息
  this.statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 监听世界边界碰撞
  blueObjects.children.iterate((object) => {
    object.body.onWorldBounds = true;
  });

  this.physics.world.on('worldbounds', () => {
    totalBounces++;
  });

  // 保存引用以便在 update 中使用
  this.blueObjects = blueObjects;
}

function onCollision(obj1, obj2) {
  // 碰撞计数
  collisionCount++;
}

function update(time, delta) {
  // 更新状态显示
  this.statusText.setText([
    `Active Objects: ${activeObjects}`,
    `Object Collisions: ${collisionCount}`,
    `Wall Bounces: ${totalBounces}`,
    `Average Speed: 240 px/s`
  ]);

  // 验证速度保持在 240 左右（考虑浮点误差）
  this.blueObjects.children.iterate((object) => {
    const velocity = object.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 如果速度偏离 240 太多，重新归一化（防止数值误差累积）
    if (Math.abs(speed - 240) > 1) {
      const angle = Math.atan2(velocity.y, velocity.x);
      object.setVelocity(Math.cos(angle) * 240, Math.sin(angle) * 240);
    }
  });
}

new Phaser.Game(config);