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

// 状态信号变量
let collisionCount = 0;
let activeObjects = 0;
let totalDistance = 0;

function preload() {
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('redCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const redObjects = this.physics.add.group({
    key: 'redCircle',
    repeat: 11, // 创建12个物体（0-11）
    setXY: {
      x: 100,
      y: 100,
      stepX: 60,
      stepY: 60
    }
  });

  // 配置每个物体
  redObjects.children.iterate((object) => {
    // 设置边界碰撞
    object.setCollideWorldBounds(true);
    
    // 设置反弹系数为1（完全弹性碰撞）
    object.setBounce(1);
    
    // 计算随机方向的速度，总速度为160
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 160;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    object.setVelocity(velocityX, velocityY);
    
    // 存储初始数据用于验证
    object.setData('initialSpeed', speed);
  });

  // 设置物体间的碰撞检测
  this.physics.add.collider(redObjects, redObjects, onCollision, null, this);

  // 更新活动物体数量
  activeObjects = redObjects.children.size;

  // 添加文本显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 存储组引用用于 update
  this.redObjects = redObjects;
}

function update(time, delta) {
  // 更新总移动距离
  if (this.redObjects) {
    this.redObjects.children.iterate((object) => {
      const velocity = object.body.velocity;
      const distance = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * (delta / 1000);
      totalDistance += distance;
    });
  }

  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText([
      `Active Objects: ${activeObjects}`,
      `Collisions: ${collisionCount}`,
      `Total Distance: ${Math.floor(totalDistance)}`,
      `Speed: 160 px/s`
    ]);
  }
}

function onCollision(object1, object2) {
  // 碰撞计数器
  collisionCount++;
  
  // 验证速度保持在160左右（考虑浮点误差）
  const speed1 = Math.sqrt(
    object1.body.velocity.x ** 2 + 
    object1.body.velocity.y ** 2
  );
  const speed2 = Math.sqrt(
    object2.body.velocity.x ** 2 + 
    object2.body.velocity.y ** 2
  );
  
  // 可选：在控制台输出碰撞信息用于调试
  if (collisionCount % 10 === 0) {
    console.log(`Collision #${collisionCount} - Speed1: ${speed1.toFixed(2)}, Speed2: ${speed2.toFixed(2)}`);
  }
}

// 启动游戏
const game = new Phaser.Game(config);