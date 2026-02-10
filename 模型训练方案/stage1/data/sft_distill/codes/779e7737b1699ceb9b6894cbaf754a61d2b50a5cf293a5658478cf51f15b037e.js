const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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
  objectCount: 0,
  totalCollisions: 0,
  objects: [],
  lastUpdate: 0
};

let objects;
let collisionCount = 0;

function preload() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00FFFF, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('cyanBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objects = this.physics.add.group({
    key: 'cyanBall',
    repeat: 11, // 创建12个物体（0-11）
    setXY: {
      x: 100,
      y: 100,
      stepX: 60,
      stepY: 60
    }
  });

  // 为每个物体设置属性
  objects.children.entries.forEach((obj, index) => {
    // 随机位置
    obj.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置随机速度方向，速度大小为120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    obj.setVelocity(velocityX, velocityY);

    // 设置反弹系数为1（完全弹性碰撞）
    obj.setBounce(1, 1);

    // 启用与世界边界的碰撞
    obj.setCollideWorldBounds(true);

    // 设置圆形碰撞体（更精确）
    obj.body.setCircle(16);
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(objects, objects, handleCollision, null, this);

  // 初始化信号
  window.__signals__.objectCount = 12;
  updateSignals();

  // 添加文本显示
  this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#00FFFF'
  });

  this.infoText = this.add.text(10, 40, 'Objects: 12 | Speed: 120', {
    fontSize: '16px',
    fill: '#FFFFFF'
  });
}

function handleCollision(obj1, obj2) {
  collisionCount++;
  window.__signals__.totalCollisions = collisionCount;
  
  // 输出碰撞日志
  console.log(JSON.stringify({
    type: 'collision',
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

  // 每秒更新一次信号
  if (time - window.__signals__.lastUpdate > 1000) {
    updateSignals();
    window.__signals__.lastUpdate = time;
  }

  // 确保速度保持在120（处理浮点误差）
  objects.children.entries.forEach(obj => {
    const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    if (Math.abs(speed - 120) > 1) {
      const ratio = 120 / speed;
      obj.setVelocity(obj.body.velocity.x * ratio, obj.body.velocity.y * ratio);
    }
  });
}

function updateSignals() {
  window.__signals__.objects = objects.children.entries.map((obj, index) => ({
    id: index,
    x: Math.round(obj.x),
    y: Math.round(obj.y),
    velocityX: Math.round(obj.body.velocity.x),
    velocityY: Math.round(obj.body.velocity.y),
    speed: Math.round(Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2))
  }));

  // 输出状态日志
  console.log(JSON.stringify({
    type: 'status',
    objectCount: window.__signals__.objectCount,
    totalCollisions: window.__signals__.totalCollisions,
    timestamp: Date.now()
  }));
}

new Phaser.Game(config);