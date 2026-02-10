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
  wallBounceCount: 0,
  objects: [],
  lastUpdate: 0
};

let pinkGroup;
const SPEED = 160;
const OBJECT_COUNT = 8;

function preload() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('pinkCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);

  // 创建物理组
  pinkGroup = this.physics.add.group({
    key: 'pinkCircle',
    repeat: OBJECT_COUNT - 1,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  const objects = pinkGroup.getChildren();
  objects.forEach((obj, index) => {
    // 随机位置（避免边缘）
    obj.x = Phaser.Math.Between(50, 750);
    obj.y = Phaser.Math.Between(50, 550);

    // 设置反弹系数
    obj.body.setBounce(1, 1);
    obj.body.setCollideWorldBounds(true);

    // 随机方向，固定速度 160
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * SPEED;
    const vy = Math.sin(angle) * SPEED;
    obj.body.setVelocity(vx, vy);

    // 监听世界边界碰撞
    obj.body.onWorldBounds = true;

    // 初始化信号数据
    window.__signals__.objects.push({
      id: index,
      x: obj.x,
      y: obj.y,
      vx: vx,
      vy: vy
    });
  });

  // 设置物体间碰撞
  this.physics.add.collider(pinkGroup, pinkGroup, handleCollision, null, this);

  // 监听世界边界碰撞事件
  this.physics.world.on('worldbounds', (body) => {
    window.__signals__.wallBounceCount++;
  });

  // 添加信息显示文本
  this.add.text(10, 10, 'Pink Objects: 8 | Speed: 160', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.collisionText = this.add.text(10, 30, 'Collisions: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.wallBounceText = this.add.text(10, 50, 'Wall Bounces: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞
  window.__signals__.collisionCount++;

  // 输出碰撞日志
  console.log(JSON.stringify({
    event: 'collision',
    time: Date.now(),
    count: window.__signals__.collisionCount,
    obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
    obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) }
  }));
}

function update(time, delta) {
  // 更新碰撞计数显示
  if (this.collisionText) {
    this.collisionText.setText('Collisions: ' + window.__signals__.collisionCount);
    this.wallBounceText.setText('Wall Bounces: ' + window.__signals__.wallBounceCount);
  }

  // 每秒更新一次物体状态信号
  if (time - window.__signals__.lastUpdate > 1000) {
    const objects = pinkGroup.getChildren();
    objects.forEach((obj, index) => {
      window.__signals__.objects[index] = {
        id: index,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
        vx: Math.round(obj.body.velocity.x),
        vy: Math.round(obj.body.velocity.y),
        speed: Math.round(Math.sqrt(
          obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2
        ))
      };
    });

    window.__signals__.lastUpdate = time;

    // 输出状态日志
    console.log(JSON.stringify({
      event: 'status',
      time: time,
      collisions: window.__signals__.collisionCount,
      wallBounces: window.__signals__.wallBounceCount,
      objectCount: objects.length
    }));
  }
}

new Phaser.Game(config);