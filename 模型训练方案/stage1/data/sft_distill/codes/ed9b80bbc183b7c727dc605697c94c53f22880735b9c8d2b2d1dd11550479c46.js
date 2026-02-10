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
let objectCount = 20;
let targetSpeed = 240;

function preload() {
  // 使用 Graphics 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('redBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const redObjects = this.physics.add.group({
    key: 'redBall',
    repeat: objectCount - 1,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  redObjects.children.iterate((object) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);

    // 设置圆形碰撞体
    object.setCircle(16);

    // 生成随机角度，然后根据目标速度计算 vx 和 vy
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * targetSpeed;
    const vy = Math.sin(angle) * targetSpeed;
    
    object.setVelocity(vx, vy);
    
    // 设置完全弹性碰撞
    object.setBounce(1, 1);
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(redObjects, redObjects, onCollision, null, this);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 存储到场景数据中以便访问
  this.redObjects = redObjects;
}

function update() {
  // 更新状态显示
  this.statusText.setText([
    `Objects: ${objectCount}`,
    `Target Speed: ${targetSpeed}`,
    `Collisions: ${collisionCount}`
  ]);

  // 确保物体速度保持在目标速度附近（可选，用于补偿浮点误差）
  this.redObjects.children.iterate((object) => {
    const body = object.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // 如果速度偏差超过 5%，进行修正
    if (Math.abs(currentSpeed - targetSpeed) > targetSpeed * 0.05) {
      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      body.setVelocity(
        Math.cos(angle) * targetSpeed,
        Math.sin(angle) * targetSpeed
      );
    }
  });
}

function onCollision(obj1, obj2) {
  // 碰撞计数器
  collisionCount++;
}

new Phaser.Game(config);