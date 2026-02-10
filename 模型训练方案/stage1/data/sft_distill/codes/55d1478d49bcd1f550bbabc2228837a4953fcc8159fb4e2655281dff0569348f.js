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
let activeObjectsCount = 0;
let totalCollisions = 0;

function preload() {
  // 使用 Graphics 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('yellowCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
  
  // 创建物理组
  const objects = this.physics.add.group({
    key: 'yellowCircle',
    repeat: 14, // 创建15个物体（1个初始 + 14个重复）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });
  
  // 为每个物体设置随机位置和速度
  objects.children.iterate((object) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);
    
    // 随机方向，但保持速度为160
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 160;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    object.setVelocity(vx, vy);
    
    // 确保物体是圆形碰撞体
    object.setCircle(16);
  });
  
  // 设置物体间的碰撞检测
  this.physics.add.collider(objects, objects, onObjectCollision, null, this);
  
  // 更新状态信号
  activeObjectsCount = objects.countActive(true);
  
  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 存储物理组引用
  this.objects = objects;
}

function update(time, delta) {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText([
      `Active Objects: ${activeObjectsCount}`,
      `Total Collisions: ${totalCollisions}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`
    ]);
  }
  
  // 验证所有物体的速度保持在160左右（允许小误差）
  this.objects.children.iterate((object) => {
    const velocity = object.body.velocity;
    const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 如果速度偏差太大，重新归一化到160
    if (Math.abs(currentSpeed - 160) > 5) {
      const angle = Math.atan2(velocity.y, velocity.x);
      object.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
    }
  });
}

// 碰撞回调函数
function onObjectCollision(obj1, obj2) {
  totalCollisions++;
}

// 启动游戏
new Phaser.Game(config);