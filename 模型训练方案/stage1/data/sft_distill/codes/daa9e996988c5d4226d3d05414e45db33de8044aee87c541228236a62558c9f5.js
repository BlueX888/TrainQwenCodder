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

// 状态信号变量
let collisionCount = 0;
let activeObjects = 0;
let totalDistance = 0;

function preload() {
  // 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('greenCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界反弹
  this.physics.world.setBoundsCollision(true, true, true, true);
  
  // 创建物理组
  const objects = this.physics.add.group({
    key: 'greenCircle',
    repeat: 19, // 创建20个物体（0-19）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });
  
  // 设置每个物体的随机位置和速度
  objects.children.iterate((obj) => {
    // 随机位置（避免太靠近边界）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    obj.setPosition(x, y);
    
    // 随机方向的360速度
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * 360;
    const vy = Math.sin(angle) * 360;
    obj.setVelocity(vx, vy);
    
    // 设置圆形碰撞体
    obj.setCircle(16);
  });
  
  // 更新活跃物体数量
  activeObjects = objects.getLength();
  
  // 设置物体间的碰撞
  this.physics.add.collider(objects, objects, handleCollision, null, this);
  
  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 存储引用供 update 使用
  this.statusText = statusText;
  this.objects = objects;
  this.lastPositions = new Map();
  
  // 初始化位置记录
  objects.children.iterate((obj) => {
    this.lastPositions.set(obj, { x: obj.x, y: obj.y });
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

function update(time, delta) {
  // 计算总移动距离
  let frameDistance = 0;
  this.objects.children.iterate((obj) => {
    const lastPos = this.lastPositions.get(obj);
    if (lastPos) {
      const dx = obj.x - lastPos.x;
      const dy = obj.y - lastPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      frameDistance += distance;
      
      // 更新位置记录
      this.lastPositions.set(obj, { x: obj.x, y: obj.y });
    }
  });
  
  totalDistance += frameDistance;
  
  // 更新状态显示
  this.statusText.setText([
    `Active Objects: ${activeObjects}`,
    `Collisions: ${collisionCount}`,
    `Total Distance: ${Math.floor(totalDistance)}px`,
    `Average Speed: 360px/s`
  ]);
}

new Phaser.Game(config);