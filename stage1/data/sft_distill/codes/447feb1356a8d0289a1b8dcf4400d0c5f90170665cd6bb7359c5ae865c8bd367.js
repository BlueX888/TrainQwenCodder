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

// 可验证的状态信号
let collisionCount = 0;
let bounceCount = 0;
let objectsCreated = 0;

function preload() {
  // 使用 Graphics 生成橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillCircle(20, 20, 20); // 半径20的圆
  graphics.generateTexture('orangeCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const orangeGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建3个橙色物体
  const positions = [
    { x: 200, y: 200 },
    { x: 600, y: 200 },
    { x: 400, y: 400 }
  ];

  positions.forEach(pos => {
    const orange = orangeGroup.create(pos.x, pos.y, 'orangeCircle');
    
    // 设置随机移动方向，速度为160
    const angle = Phaser.Math.Between(0, 360);
    const velocity = this.physics.velocityFromAngle(angle, 160);
    orange.setVelocity(velocity.x, velocity.y);
    
    // 设置圆形碰撞体
    orange.setCircle(20);
    
    objectsCreated++;
  });

  // 设置物体间碰撞
  this.physics.add.collider(orangeGroup, orangeGroup, () => {
    collisionCount++;
  });

  // 监听世界边界碰撞
  orangeGroup.children.entries.forEach(orange => {
    orange.body.onWorldBounds = true;
  });

  this.physics.world.on('worldbounds', () => {
    bounceCount++;
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
      `Objects Created: ${objectsCreated}`,
      `Collisions: ${collisionCount}`,
      `Wall Bounces: ${bounceCount}`,
      `Speed: 160 px/s`
    ]);
  });

  // 添加提示文本
  this.add.text(400, 550, 'Orange objects moving at 160 speed with collision', {
    fontSize: '14px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 游戏逻辑在物理引擎中自动处理
  // 可以在这里添加额外的更新逻辑
}

// 启动游戏
new Phaser.Game(config);