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
let statusText;

function preload() {
  // 使用 Graphics 生成绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('greenBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 启用世界边界
  this.physics.world.setBoundsCollision(true, true, true, true);
  
  // 创建物理组
  const objects = this.physics.add.group({
    key: 'greenBall',
    quantity: 20,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });
  
  // 设置每个物体的随机位置和速度
  objects.children.iterate((object) => {
    // 随机位置（避免太靠边）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);
    
    // 随机方向，固定速度 80
    const angle = Phaser.Math.Between(0, 360);
    const velocityX = Math.cos(angle * Math.PI / 180) * 80;
    const velocityY = Math.sin(angle * Math.PI / 180) * 80;
    object.setVelocity(velocityX, velocityY);
    
    // 设置圆形碰撞体（更精确）
    object.setCircle(16);
  });
  
  // 设置物体间碰撞
  this.physics.add.collider(objects, objects, onCollision, null, this);
  
  // 更新活动物体数量
  activeObjects = objects.countActive(true);
  
  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();
}

function update(time, delta) {
  // 更新状态显示
  updateStatusText();
}

// 碰撞回调函数
function onCollision(obj1, obj2) {
  collisionCount++;
}

// 更新状态文本
function updateStatusText() {
  statusText.setText([
    `Active Objects: ${activeObjects}`,
    `Total Collisions: ${collisionCount}`,
    `Speed: 80 px/s`
  ]);
}

new Phaser.Game(config);