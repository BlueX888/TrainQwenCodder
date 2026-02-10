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

// 全局验证信号
window.__signals__ = {
  objectCount: 0,
  averageSpeed: 0,
  collisionCount: 0,
  activeObjects: 0,
  totalDistance: 0
};

let objects;
let collisionCount = 0;

function preload() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径16的圆形
  graphics.generateTexture('cyanCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objects = this.physics.add.group({
    key: 'cyanCircle',
    repeat: 11, // 创建12个对象（1 + 11）
    setXY: {
      x: 100,
      y: 100,
      stepX: 60,
      stepY: 60
    }
  });

  // 配置每个物体
  objects.children.iterate((obj, index) => {
    // 随机初始位置
    obj.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置随机速度方向，速度大小为 120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    
    obj.setVelocity(velocityX, velocityY);

    // 启用世界边界碰撞
    obj.setCollideWorldBounds(true);
    
    // 设置反弹系数为 1（完全弹性碰撞）
    obj.setBounce(1, 1);

    // 设置圆形碰撞体
    obj.body.setCircle(16);
  });

  // 添加物体间的碰撞检测
  this.physics.add.collider(objects, objects, handleCollision, null, this);

  // 初始化验证信号
  updateSignals();

  // 添加文本显示信息
  this.infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  console.log('Game started with 12 cyan objects at speed 120');
}

function handleCollision(obj1, obj2) {
  collisionCount++;
  window.__signals__.collisionCount = collisionCount;
  
  // 输出碰撞日志
  if (collisionCount % 10 === 0) {
    console.log(JSON.stringify({
      event: 'collision',
      count: collisionCount,
      time: Date.now()
    }));
  }
}

function update(time, delta) {
  // 更新验证信号
  updateSignals();

  // 更新显示信息
  if (this.infoText) {
    this.infoText.setText([
      `Objects: ${window.__signals__.objectCount}`,
      `Avg Speed: ${window.__signals__.averageSpeed.toFixed(2)}`,
      `Collisions: ${window.__signals__.collisionCount}`,
      `Total Distance: ${window.__signals__.totalDistance.toFixed(0)}`
    ]);
  }

  // 累计移动距离
  objects.children.iterate((obj) => {
    const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    window.__signals__.totalDistance += speed * (delta / 1000);
  });
}

function updateSignals() {
  // 统计活跃物体数量
  const activeCount = objects.children.size;
  window.__signals__.objectCount = activeCount;
  window.__signals__.activeObjects = activeCount;

  // 计算平均速度
  let totalSpeed = 0;
  objects.children.iterate((obj) => {
    const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    totalSpeed += speed;
  });
  window.__signals__.averageSpeed = activeCount > 0 ? totalSpeed / activeCount : 0;

  // 每隔一段时间输出状态日志
  if (Math.floor(Date.now() / 1000) % 5 === 0) {
    console.log(JSON.stringify({
      signals: window.__signals__,
      timestamp: Date.now()
    }));
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);