const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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

// 全局状态信号
window.__signals__ = {
  totalObjects: 12,
  collisionCount: 0,
  bounceCount: 0,
  objects: [],
  timestamp: Date.now()
};

function preload() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径 16 的圆
  graphics.generateTexture('cyanBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  this.objectGroup = this.physics.add.group({
    key: 'cyanBall',
    repeat: 11, // 总共 12 个物体
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 配置每个物体
  this.objectGroup.children.iterate((object, index) => {
    // 设置随机位置
    object.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置随机速度方向，速度大小为 120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    
    object.setVelocity(velocityX, velocityY);
    
    // 设置反弹系数为 1（完全弹性碰撞）
    object.setBounce(1, 1);
    
    // 设置与世界边界碰撞
    object.setCollideWorldBounds(true);
    
    // 记录初始状态
    window.__signals__.objects.push({
      id: index,
      x: object.x,
      y: object.y,
      velocityX: velocityX,
      velocityY: velocityY
    });
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(
    this.objectGroup,
    this.objectGroup,
    this.onObjectCollision,
    null,
    this
  );

  // 添加信息文本
  this.infoText = this.add.text(10, 10, '', {
    font: '16px Arial',
    fill: '#00ffff'
  });

  // 记录碰撞监听
  this.physics.world.on('worldbounds', () => {
    window.__signals__.bounceCount++;
  });

  console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));
}

function onObjectCollision(obj1, obj2) {
  // 记录碰撞事件
  window.__signals__.collisionCount++;
  
  // 输出碰撞日志
  if (window.__signals__.collisionCount % 10 === 0) {
    console.log('Collision event:', JSON.stringify({
      collisionCount: window.__signals__.collisionCount,
      timestamp: Date.now() - window.__signals__.timestamp
    }));
  }
}

function update(time, delta) {
  // 更新物体位置信息
  this.objectGroup.children.iterate((object, index) => {
    if (window.__signals__.objects[index]) {
      window.__signals__.objects[index].x = Math.round(object.x);
      window.__signals__.objects[index].y = Math.round(object.y);
      window.__signals__.objects[index].velocityX = Math.round(object.body.velocity.x);
      window.__signals__.objects[index].velocityY = Math.round(object.body.velocity.y);
    }
  });

  // 更新显示文本
  this.infoText.setText([
    `Objects: ${window.__signals__.totalObjects}`,
    `Collisions: ${window.__signals__.collisionCount}`,
    `Time: ${Math.floor((Date.now() - window.__signals__.timestamp) / 1000)}s`
  ]);

  // 每 5 秒输出一次状态
  if (Math.floor(time / 5000) > Math.floor((time - delta) / 5000)) {
    console.log('Status update:', JSON.stringify({
      collisionCount: window.__signals__.collisionCount,
      averageSpeed: this.calculateAverageSpeed(),
      runtime: Math.floor((Date.now() - window.__signals__.timestamp) / 1000)
    }));
  }
}

// 计算平均速度
Phaser.Scene.prototype.calculateAverageSpeed = function() {
  let totalSpeed = 0;
  this.objectGroup.children.iterate((object) => {
    const speed = Math.sqrt(
      object.body.velocity.x ** 2 + 
      object.body.velocity.y ** 2
    );
    totalSpeed += speed;
  });
  return Math.round(totalSpeed / this.objectGroup.children.size);
};

new Phaser.Game(config);