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

// 可验证状态变量
let collisionCount = 0;
let bounceCount = 0;
let redObjects;
let statusText;

function preload() {
  // 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('redCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  redObjects = this.physics.add.group({
    key: 'redCircle',
    repeat: 4, // 创建5个对象（1个默认 + 4个重复）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  const speed = 120;
  const objects = redObjects.getChildren();
  
  objects.forEach((obj, index) => {
    // 随机位置
    obj.setPosition(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500)
    );
    
    // 随机方向，但保持速度为120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    obj.setVelocity(vx, vy);
    
    // 设置圆形碰撞体
    obj.body.setCircle(20);
  });

  // 设置物体间的碰撞
  this.physics.add.collider(redObjects, redObjects, onCollision, null, this);

  // 监听世界边界碰撞
  objects.forEach(obj => {
    obj.body.onWorldBounds = true;
  });

  this.physics.world.on('worldbounds', () => {
    bounceCount++;
  });

  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update(time, delta) {
  // 确保每个物体的速度保持在120左右
  const objects = redObjects.getChildren();
  const targetSpeed = 120;
  
  objects.forEach(obj => {
    const body = obj.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // 如果速度偏差较大，重新调整
    if (Math.abs(currentSpeed - targetSpeed) > 5) {
      const scale = targetSpeed / currentSpeed;
      body.setVelocity(
        body.velocity.x * scale,
        body.velocity.y * scale
      );
    }
  });

  updateStatusText();
}

function onCollision(obj1, obj2) {
  collisionCount++;
  
  // 碰撞后确保速度保持为120
  const speed = 120;
  
  [obj1, obj2].forEach(obj => {
    const body = obj.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    if (currentSpeed > 0) {
      const scale = speed / currentSpeed;
      body.setVelocity(
        body.velocity.x * scale,
        body.velocity.y * scale
      );
    }
  });
}

function updateStatusText() {
  statusText.setText([
    `Objects: ${redObjects.getChildren().length}`,
    `Collisions: ${collisionCount}`,
    `Wall Bounces: ${bounceCount}`,
    `Speed: 120 px/s`
  ]);
}

new Phaser.Game(config);