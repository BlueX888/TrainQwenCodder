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

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('blueCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 启用世界边界碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
  
  // 创建物理组
  const blueObjects = this.physics.add.group({
    key: 'blueCircle',
    repeat: 7, // 创建 8 个物体（1 + 7）
    setXY: {
      x: 100,
      y: 100,
      stepX: 80,
      stepY: 60
    }
  });
  
  // 设置每个物体的属性
  blueObjects.children.iterate((child) => {
    // 设置随机方向的速度，总速度为 300
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 300;
    const velocityY = Math.sin(angle) * 300;
    
    child.setVelocity(velocityX, velocityY);
    
    // 设置完全反弹
    child.setBounce(1, 1);
    
    // 启用世界边界碰撞
    child.setCollideWorldBounds(true);
    
    // 设置圆形碰撞体
    child.body.setCircle(20);
  });
  
  // 更新活跃物体数量
  activeObjects = blueObjects.children.size;
  
  // 启用物体间碰撞
  this.physics.add.collider(blueObjects, blueObjects, () => {
    collisionCount++;
  });
  
  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 更新状态显示
  this.events.on('update', () => {
    statusText.setText([
      `Active Objects: ${activeObjects}`,
      `Collisions: ${collisionCount}`,
      `Speed: 300 px/s`
    ]);
  });
  
  // 添加说明文本
  this.add.text(400, 580, 'Blue objects moving at 300 speed with bounce', {
    fontSize: '14px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 游戏循环更新（物理系统自动处理移动和碰撞）
}

new Phaser.Game(config);