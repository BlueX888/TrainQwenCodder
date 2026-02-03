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
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  collisionCount: 0,
  totalBounces: 0,
  objects: []
};

function preload() {
  // 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('grayBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  this.objectGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 20 个物体
  for (let i = 0; i < 20; i++) {
    // 随机初始位置（避免边界）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = this.objectGroup.create(x, y, 'grayBall');
    
    // 设置随机方向，但保持速度为 120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 120;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    obj.setVelocity(vx, vy);
    obj.setCircle(16); // 设置碰撞体为圆形
    obj.setBounce(1); // 完全弹性碰撞
    obj.setCollideWorldBounds(true); // 与世界边界碰撞
    
    // 记录物体ID
    obj.objectId = i;
  }

  // 设置物体间碰撞
  this.physics.add.collider(this.objectGroup, this.objectGroup, handleCollision, null, this);

  // 初始化信号
  window.__signals__.objectCount = 20;
  window.__signals__.collisionCount = 0;
  window.__signals__.totalBounces = 0;

  // 添加文本显示
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 碰撞计数器
  this.collisionCount = 0;
  this.bounceCount = 0;

  console.log('[GAME_START]', JSON.stringify({
    timestamp: Date.now(),
    objectCount: 20,
    speed: 120
  }));
}

function handleCollision(obj1, obj2) {
  // 增加碰撞计数
  this.collisionCount++;
  window.__signals__.collisionCount = this.collisionCount;
  
  // 记录碰撞日志
  if (this.collisionCount % 10 === 0) {
    console.log('[COLLISION]', JSON.stringify({
      timestamp: Date.now(),
      count: this.collisionCount,
      obj1: { id: obj1.objectId, x: Math.round(obj1.x), y: Math.round(obj1.y) },
      obj2: { id: obj2.objectId, x: Math.round(obj2.x), y: Math.round(obj2.y) }
    }));
  }
}

function update(time, delta) {
  // 更新信号对象
  const objects = [];
  this.objectGroup.children.entries.forEach((obj, index) => {
    // 确保速度保持在 120 左右
    const currentSpeed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    
    // 如果速度偏离 120 太多，重新归一化
    if (Math.abs(currentSpeed - 120) > 1) {
      const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
      obj.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);
    }

    objects.push({
      id: obj.objectId,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      vx: Math.round(obj.body.velocity.x),
      vy: Math.round(obj.body.velocity.y),
      speed: Math.round(currentSpeed)
    });

    // 检测边界反弹
    if (obj.body.blocked.left || obj.body.blocked.right || 
        obj.body.blocked.up || obj.body.blocked.down) {
      this.bounceCount++;
      window.__signals__.totalBounces = this.bounceCount;
    }
  });

  window.__signals__.objects = objects;

  // 更新显示文本
  this.statusText.setText([
    `Objects: ${window.__signals__.objectCount}`,
    `Collisions: ${window.__signals__.collisionCount}`,
    `Bounces: ${window.__signals__.totalBounces}`,
    `Speed: 120`
  ]);

  // 每 5 秒输出一次状态日志
  if (Math.floor(time / 5000) > Math.floor((time - delta) / 5000)) {
    console.log('[STATUS]', JSON.stringify({
      timestamp: Date.now(),
      time: Math.round(time / 1000),
      collisions: window.__signals__.collisionCount,
      bounces: window.__signals__.totalBounces,
      avgSpeed: Math.round(objects.reduce((sum, obj) => sum + obj.speed, 0) / objects.length)
    }));
  }
}

new Phaser.Game(config);