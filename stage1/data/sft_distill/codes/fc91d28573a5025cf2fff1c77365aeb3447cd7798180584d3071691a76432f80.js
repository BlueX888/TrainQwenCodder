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

// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  objectCount: 0,
  collisionCount: 0,
  totalDistance: 0,
  averageSpeed: 0
};

let blueObjects;
let lastUpdateTime = 0;

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1); // 蓝色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('blueCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  blueObjects = this.physics.add.group({
    key: 'blueCircle',
    quantity: 20,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  blueObjects.children.iterate((object) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);

    // 设置圆形碰撞体
    object.setCircle(16);
    object.body.setCollideWorldBounds(true);
    object.body.setBounce(1, 1);

    // 随机方向，但速度大小固定为 80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 80;
    const velocityY = Math.sin(angle) * 80;
    object.setVelocity(velocityX, velocityY);
  });

  // 设置物体间碰撞
  this.physics.add.collider(blueObjects, blueObjects, onCollision, null, this);

  // 初始化信号
  window.__signals__.objectCount = blueObjects.getLength();
  window.__signals__.collisionCount = 0;
  window.__signals__.totalDistance = 0;
  window.__signals__.averageSpeed = 80;

  // 添加文本显示
  this.add.text(10, 10, 'Blue Objects: 20', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setDepth(100);

  this.collisionText = this.add.text(10, 30, 'Collisions: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setDepth(100);

  this.distanceText = this.add.text(10, 50, 'Total Distance: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setDepth(100);

  lastUpdateTime = 0;

  // 输出初始状态到控制台
  console.log(JSON.stringify({
    event: 'game_start',
    timestamp: Date.now(),
    objectCount: 20,
    speed: 80
  }));
}

function update(time, delta) {
  // 计算总移动距离
  const deltaSeconds = delta / 1000;
  blueObjects.children.iterate((object) => {
    const speed = Math.sqrt(
      object.body.velocity.x ** 2 + 
      object.body.velocity.y ** 2
    );
    window.__signals__.totalDistance += speed * deltaSeconds;
  });

  // 每秒更新一次显示
  if (time - lastUpdateTime > 1000) {
    this.collisionText.setText(`Collisions: ${window.__signals__.collisionCount}`);
    this.distanceText.setText(`Total Distance: ${Math.floor(window.__signals__.totalDistance)}`);
    lastUpdateTime = time;

    // 输出状态日志
    console.log(JSON.stringify({
      event: 'status_update',
      timestamp: Date.now(),
      collisions: window.__signals__.collisionCount,
      totalDistance: Math.floor(window.__signals__.totalDistance),
      activeObjects: blueObjects.getLength()
    }));
  }
}

function onCollision(obj1, obj2) {
  // 增加碰撞计数
  window.__signals__.collisionCount++;

  // 确保碰撞后速度保持在 80 左右
  [obj1, obj2].forEach(obj => {
    const currentSpeed = Math.sqrt(
      obj.body.velocity.x ** 2 + 
      obj.body.velocity.y ** 2
    );
    
    // 如果速度偏差较大，重新归一化到 80
    if (Math.abs(currentSpeed - 80) > 5) {
      const scale = 80 / currentSpeed;
      obj.setVelocity(
        obj.body.velocity.x * scale,
        obj.body.velocity.y * scale
      );
    }
  });

  // 记录碰撞事件
  if (window.__signals__.collisionCount % 10 === 0) {
    console.log(JSON.stringify({
      event: 'collision',
      timestamp: Date.now(),
      collisionCount: window.__signals__.collisionCount
    }));
  }
}

new Phaser.Game(config);