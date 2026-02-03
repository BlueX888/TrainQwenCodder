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
  averageSpeed: 0,
  timestamp: Date.now()
};

let objects;
let collisionCount = 0;

function preload() {
  // 使用 Graphics 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFFF00, 1); // 黄色
  graphics.fillCircle(16, 16, 16); // 半径 16 的圆
  graphics.generateTexture('yellowCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objects = this.physics.add.group({
    key: 'yellowCircle',
    repeat: 19, // 创建 20 个物体（0-19）
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 为每个物体设置属性
  objects.children.iterate((object) => {
    // 设置反弹系数为 1（完全弹性碰撞）
    object.setBounce(1);
    
    // 设置与世界边界碰撞
    object.setCollideWorldBounds(true);
    
    // 设置随机速度，总速度约为 200
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 200;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    object.setVelocity(velocityX, velocityY);
    
    // 设置圆形碰撞体
    object.setCircle(16);
  });

  // 添加物体之间的碰撞检测
  this.physics.add.collider(objects, objects, handleCollision, null, this);

  // 更新初始信号
  window.__signals__.objectCount = objects.children.size;
  window.__signals__.timestamp = Date.now();

  // 添加调试文本
  this.add.text(10, 10, 'Yellow Objects: 20', {
    fontSize: '16px',
    fill: '#fff'
  }).setDepth(100);

  this.collisionText = this.add.text(10, 30, 'Collisions: 0', {
    fontSize: '16px',
    fill: '#fff'
  }).setDepth(100);
}

function handleCollision(obj1, obj2) {
  // 碰撞计数
  collisionCount++;
  
  // 更新信号
  window.__signals__.collisionCount = collisionCount;
  window.__signals__.timestamp = Date.now();
  
  // 输出 JSON 日志
  console.log(JSON.stringify({
    event: 'collision',
    count: collisionCount,
    obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
    obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) },
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 更新碰撞计数显示
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + collisionCount);
  }

  // 计算平均速度并更新信号
  let totalSpeed = 0;
  let count = 0;
  
  objects.children.iterate((object) => {
    const speed = Math.sqrt(
      object.body.velocity.x * object.body.velocity.x +
      object.body.velocity.y * object.body.velocity.y
    );
    totalSpeed += speed;
    count++;
  });

  const avgSpeed = count > 0 ? totalSpeed / count : 0;
  window.__signals__.averageSpeed = Math.round(avgSpeed);
  
  // 每 60 帧输出一次状态日志
  if (Math.floor(time / 1000) % 1 === 0 && time % 1000 < 16) {
    console.log(JSON.stringify({
      event: 'status',
      objectCount: window.__signals__.objectCount,
      collisionCount: window.__signals__.collisionCount,
      averageSpeed: window.__signals__.averageSpeed,
      timestamp: Date.now()
    }));
  }
}

new Phaser.Game(config);