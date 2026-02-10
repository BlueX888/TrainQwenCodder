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
  collisionCount: 0,
  objects: [],
  lastUpdate: 0
};

function preload() {
  // 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('greenCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const group = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 5 个绿色物体
  for (let i = 0; i < 5; i++) {
    // 随机位置
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    const obj = group.create(x, y, 'greenCircle');
    
    // 设置随机方向的速度，速度大小为 80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 80;
    const velocityY = Math.sin(angle) * 80;
    
    obj.setVelocity(velocityX, velocityY);
    obj.setBounce(1, 1);
    obj.setCollideWorldBounds(true);
    
    // 记录初始状态
    window.__signals__.objects.push({
      id: i,
      x: x,
      y: y,
      velocityX: velocityX,
      velocityY: velocityY
    });
  }

  // 设置物体间的碰撞
  this.physics.add.collider(group, group, onCollision, null, this);

  // 添加文本显示碰撞次数
  this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 保存组引用用于 update
  this.objectGroup = group;
}

function onCollision(obj1, obj2) {
  // 记录碰撞
  window.__signals__.collisionCount++;
  
  console.log(JSON.stringify({
    type: 'collision',
    count: window.__signals__.collisionCount,
    time: Date.now(),
    obj1: { x: obj1.x, y: obj1.y, vx: obj1.body.velocity.x, vy: obj1.body.velocity.y },
    obj2: { x: obj2.x, y: obj2.y, vx: obj2.body.velocity.x, vy: obj2.body.velocity.y }
  }));
}

function update(time, delta) {
  // 更新碰撞计数显示
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + window.__signals__.collisionCount);
  }

  // 每秒更新一次物体状态信号
  if (time - window.__signals__.lastUpdate > 1000) {
    window.__signals__.lastUpdate = time;
    window.__signals__.objects = [];
    
    this.objectGroup.children.entries.forEach((obj, index) => {
      window.__signals__.objects.push({
        id: index,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
        velocityX: Math.round(obj.body.velocity.x * 100) / 100,
        velocityY: Math.round(obj.body.velocity.y * 100) / 100,
        speed: Math.round(Math.sqrt(
          obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2
        ) * 100) / 100
      });
    });

    console.log(JSON.stringify({
      type: 'status',
      time: time,
      collisionCount: window.__signals__.collisionCount,
      objects: window.__signals__.objects
    }));
  }
}

new Phaser.Game(config);