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
  },
  backgroundColor: '#2d2d2d'
};

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  collisionCount: 0,
  objects: [],
  timestamp: Date.now()
};

function preload() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('grayCircle', 40, 40);
  graphics.destroy();
}

function create() {
  const scene = this;
  
  // 创建物理组
  const objects = this.physics.add.group({
    key: 'grayCircle',
    repeat: 9, // 创建 10 个物体（0-9）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和随机速度
  const speed = 80;
  objects.children.iterate((object, index) => {
    // 随机位置（避免边缘）
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    object.setPosition(x, y);
    
    // 随机方向，固定速度大小为 80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    object.setVelocity(vx, vy);
    
    // 设置碰撞体为圆形
    object.setCircle(20);
    
    // 记录到信号对象
    window.__signals__.objects.push({
      id: index,
      x: x,
      y: y,
      vx: vx,
      vy: vy
    });
  });

  // 设置物体间的碰撞
  this.physics.add.collider(objects, objects, onCollision, null, this);

  // 更新信号
  window.__signals__.objectCount = objects.children.size;
  
  // 添加文本显示
  this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  this.infoText = this.add.text(10, 40, 'Objects: 10 | Speed: 80', {
    fontSize: '16px',
    fill: '#cccccc'
  });

  // 保存对象引用
  this.objects = objects;
}

function onCollision(obj1, obj2) {
  // 碰撞计数
  window.__signals__.collisionCount++;
  
  // 输出日志
  console.log(JSON.stringify({
    event: 'collision',
    count: window.__signals__.collisionCount,
    obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
    obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) },
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 更新碰撞显示
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + window.__signals__.collisionCount);
  }
  
  // 每秒更新一次物体状态到信号
  if (!this.lastUpdate || time - this.lastUpdate > 1000) {
    this.lastUpdate = time;
    
    window.__signals__.objects = [];
    this.objects.children.iterate((object, index) => {
      window.__signals__.objects.push({
        id: index,
        x: Math.round(object.x),
        y: Math.round(object.y),
        vx: Math.round(object.body.velocity.x),
        vy: Math.round(object.body.velocity.y)
      });
    });
    
    window.__signals__.timestamp = Date.now();
    
    // 输出状态日志
    console.log(JSON.stringify({
      event: 'status',
      objectCount: window.__signals__.objectCount,
      collisionCount: window.__signals__.collisionCount,
      timestamp: window.__signals__.timestamp
    }));
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);