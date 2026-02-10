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

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  collisionCount: 0,
  objects: [],
  timestamp: Date.now()
};

function preload() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('grayBox', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  this.objectGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 10 个灰色物体
  for (let i = 0; i < 10; i++) {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 创建物体
    const obj = this.objectGroup.create(x, y, 'grayBox');
    
    // 设置随机速度方向，速度大小为 80
    const angle = Phaser.Math.Between(0, 360);
    const velocityX = Math.cos(angle * Math.PI / 180) * 80;
    const velocityY = Math.sin(angle * Math.PI / 180) * 80;
    
    obj.setVelocity(velocityX, velocityY);
    obj.setBounce(1, 1);
    obj.setCollideWorldBounds(true);
    
    // 记录物体信息到信号
    window.__signals__.objects.push({
      id: i,
      x: x,
      y: y,
      velocityX: velocityX,
      velocityY: velocityY
    });
  }

  // 设置物体间的碰撞
  this.physics.add.collider(
    this.objectGroup,
    this.objectGroup,
    this.onCollision,
    null,
    this
  );

  // 更新信号
  window.__signals__.objectCount = 10;
  window.__signals__.timestamp = Date.now();

  // 添加文本显示
  this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  this.infoText = this.add.text(10, 40, 'Objects: 10 | Speed: 80', {
    fontSize: '16px',
    fill: '#cccccc'
  });
}

function onCollision(obj1, obj2) {
  // 记录碰撞事件
  window.__signals__.collisionCount++;
  
  // 输出碰撞日志
  console.log(JSON.stringify({
    event: 'collision',
    timestamp: Date.now(),
    collisionCount: window.__signals__.collisionCount,
    obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
    obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) }
  }));
}

function update(time, delta) {
  // 更新显示文本
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + window.__signals__.collisionCount);
  }

  // 更新信号中的物体位置（每秒更新一次）
  if (!this.lastSignalUpdate || time - this.lastSignalUpdate > 1000) {
    this.lastSignalUpdate = time;
    
    const objects = this.objectGroup.getChildren();
    window.__signals__.objects = objects.map((obj, index) => ({
      id: index,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      velocityX: Math.round(obj.body.velocity.x),
      velocityY: Math.round(obj.body.velocity.y),
      speed: Math.round(Math.sqrt(
        obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2
      ))
    }));
    
    window.__signals__.timestamp = Date.now();
  }
}

// 启动游戏
new Phaser.Game(config);