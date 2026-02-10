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
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  totalCollisions: 0,
  objectStates: [],
  averageSpeed: 0,
  timestamp: 0
};

let objects;
let collisionCount = 0;

function preload() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF69B4, 1); // 粉色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('pinkCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objects = this.physics.add.group({
    key: 'pinkCircle',
    repeat: 7, // 创建8个物体（1个默认 + 7个重复）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  const objectsArray = objects.getChildren();
  objectsArray.forEach((obj, index) => {
    // 随机位置（避免边界）
    obj.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 随机方向的速度，总速度为160
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 160;
    const velocityY = Math.sin(angle) * 160;
    
    obj.setVelocity(velocityX, velocityY);
    
    // 设置反弹
    obj.setBounce(1, 1);
    obj.setCollideWorldBounds(true);
    
    // 添加标识
    obj.setData('id', index);
  });

  // 设置物体间的碰撞
  this.physics.add.collider(objects, objects, onCollision, null, this);

  // 添加文本显示
  this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  this.objectText = this.add.text(10, 40, 'Objects: 8', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  console.log('Game initialized with 8 pink objects at speed 160');
}

function onCollision(obj1, obj2) {
  collisionCount++;
  window.__signals__.totalCollisions = collisionCount;
  
  // 记录碰撞日志
  console.log(JSON.stringify({
    type: 'collision',
    timestamp: Date.now(),
    object1: obj1.getData('id'),
    object2: obj2.getData('id'),
    totalCollisions: collisionCount
  }));
}

function update(time, delta) {
  // 更新碰撞显示
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + collisionCount);
  }

  // 收集所有物体状态
  const objectsArray = objects.getChildren();
  const states = [];
  let totalSpeed = 0;

  objectsArray.forEach((obj) => {
    const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    totalSpeed += speed;
    
    states.push({
      id: obj.getData('id'),
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      velocityX: Math.round(obj.body.velocity.x * 100) / 100,
      velocityY: Math.round(obj.body.velocity.y * 100) / 100,
      speed: Math.round(speed * 100) / 100
    });
  });

  // 更新全局信号
  window.__signals__.objectCount = objectsArray.length;
  window.__signals__.objectStates = states;
  window.__signals__.averageSpeed = Math.round((totalSpeed / objectsArray.length) * 100) / 100;
  window.__signals__.timestamp = time;

  // 每秒输出一次状态日志
  if (!this.lastLogTime || time - this.lastLogTime > 1000) {
    this.lastLogTime = time;
    console.log(JSON.stringify({
      type: 'status',
      timestamp: Date.now(),
      objectCount: window.__signals__.objectCount,
      totalCollisions: window.__signals__.totalCollisions,
      averageSpeed: window.__signals__.averageSpeed,
      sampleObject: states[0]
    }));
  }
}

new Phaser.Game(config);