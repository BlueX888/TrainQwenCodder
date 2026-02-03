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
  bounceCount: 0,
  timestamp: 0
};

let greenGroup;
let collider;

function preload() {
  // 使用 Graphics 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('greenCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  greenGroup = this.physics.add.group({
    key: 'greenCircle',
    repeat: 4, // 创建 5 个物体 (0-4)
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  const children = greenGroup.getChildren();
  children.forEach((obj, index) => {
    // 随机位置
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    obj.setPosition(x, y);

    // 随机方向的速度，速度大小为 80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 80;
    const velocityY = Math.sin(angle) * 80;
    obj.setVelocity(velocityX, velocityY);

    // 设置碰撞体积
    obj.setCircle(20);
  });

  // 设置物体之间的碰撞
  collider = this.physics.add.collider(greenGroup, greenGroup, onCollision);

  // 监听世界边界碰撞
  this.physics.world.on('worldbounds', () => {
    window.__signals__.bounceCount++;
  });

  // 初始化信号
  window.__signals__.collisionCount = 0;
  window.__signals__.bounceCount = 0;
  window.__signals__.timestamp = Date.now();

  // 添加文本显示
  this.add.text(10, 10, 'Green Objects: 5', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  this.collisionText = this.add.text(10, 35, 'Collisions: 0', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  this.bounceText = this.add.text(10, 60, 'Wall Bounces: 0', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 更新信号数据
  const children = greenGroup.getChildren();
  window.__signals__.objects = children.map((obj, index) => ({
    id: index,
    x: Math.round(obj.x),
    y: Math.round(obj.y),
    velocityX: Math.round(obj.body.velocity.x * 100) / 100,
    velocityY: Math.round(obj.body.velocity.y * 100) / 100,
    speed: Math.round(Math.sqrt(
      obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2
    ))
  }));

  window.__signals__.timestamp = time;

  // 更新显示文本
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + window.__signals__.collisionCount);
  }
  if (this.bounceText) {
    this.bounceText.setText('Wall Bounces: ' + window.__signals__.bounceCount);
  }

  // 每秒输出一次日志
  if (!this.lastLogTime || time - this.lastLogTime > 1000) {
    this.lastLogTime = time;
    console.log(JSON.stringify({
      time: Math.round(time),
      collisions: window.__signals__.collisionCount,
      bounces: window.__signals__.bounceCount,
      objectCount: children.length,
      averageSpeed: Math.round(
        window.__signals__.objects.reduce((sum, obj) => sum + obj.speed, 0) / 
        window.__signals__.objects.length
      )
    }));
  }
}

function onCollision(obj1, obj2) {
  // 记录碰撞次数
  window.__signals__.collisionCount++;
}

// 启动游戏
new Phaser.Game(config);