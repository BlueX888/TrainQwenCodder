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

// 全局信号对象用于验证
window.__signals__ = {
  objectCount: 0,
  collisionCount: 0,
  totalBounces: 0,
  activeObjects: []
};

function preload() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('pinkCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  this.pinkObjects = this.physics.add.group({
    key: 'pinkCircle',
    repeat: 7, // 创建8个物体（1+7）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  const speed = 160;
  let index = 0;
  
  this.pinkObjects.children.iterate((obj) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    obj.setPosition(x, y);
    
    // 随机方向，但保持速度为160
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    obj.setVelocity(vx, vy);
    
    // 记录到信号
    window.__signals__.activeObjects.push({
      id: index++,
      x: x,
      y: y,
      vx: vx,
      vy: vy
    });
  });
  
  window.__signals__.objectCount = this.pinkObjects.getLength();
  
  // 设置物体之间的碰撞
  this.physics.add.collider(this.pinkObjects, this.pinkObjects, onCollision, null, this);
  
  // 监听世界边界碰撞
  this.pinkObjects.children.iterate((obj) => {
    obj.body.onWorldBounds = true;
  });
  
  this.physics.world.on('worldbounds', () => {
    window.__signals__.totalBounces++;
  });
  
  // 添加文本显示
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  console.log('Game started with signals:', JSON.stringify(window.__signals__));
}

function onCollision(obj1, obj2) {
  window.__signals__.collisionCount++;
  
  // 记录碰撞事件
  console.log(JSON.stringify({
    event: 'collision',
    count: window.__signals__.collisionCount,
    obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
    obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) },
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 更新状态显示
  this.statusText.setText([
    `Objects: ${window.__signals__.objectCount}`,
    `Collisions: ${window.__signals__.collisionCount}`,
    `Wall Bounces: ${window.__signals__.totalBounces}`
  ]);
  
  // 验证速度保持在160左右（允许微小误差）
  this.pinkObjects.children.iterate((obj, index) => {
    const velocity = obj.body.velocity;
    const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 如果速度偏差过大，重新归一化到160
    if (Math.abs(currentSpeed - 160) > 1) {
      const angle = Math.atan2(velocity.y, velocity.x);
      obj.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
    }
    
    // 更新信号中的位置信息（每60帧更新一次以减少开销）
    if (time % 1000 < delta) {
      window.__signals__.activeObjects[index] = {
        id: index,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
        vx: Math.round(velocity.x),
        vy: Math.round(velocity.y),
        speed: Math.round(currentSpeed)
      };
    }
  });
  
  // 每5秒输出一次状态日志
  if (Math.floor(time / 5000) > Math.floor((time - delta) / 5000)) {
    console.log('Status:', JSON.stringify({
      time: Math.floor(time / 1000) + 's',
      signals: window.__signals__
    }));
  }
}

new Phaser.Game(config);