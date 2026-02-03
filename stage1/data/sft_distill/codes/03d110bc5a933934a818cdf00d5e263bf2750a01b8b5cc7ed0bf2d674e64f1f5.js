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
let activeObjects = 0;
let collisionCount = 0;

function preload() {
  // 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('yellowCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const objectsGroup = this.physics.add.group({
    key: 'yellowCircle',
    repeat: 14, // 创建15个物体（1个初始 + 14个重复）
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 为每个物体设置属性
  objectsGroup.children.iterate((child) => {
    // 随机生成速度方向（角度）
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 160;
    const velocityY = Math.sin(angle) * 160;
    
    // 设置速度
    child.setVelocity(velocityX, velocityY);
    
    // 设置边界碰撞反弹
    child.setBounce(1, 1);
    child.setCollideWorldBounds(true);
    
    // 设置随机初始位置，避免重叠
    child.x = Phaser.Math.Between(50, 750);
    child.y = Phaser.Math.Between(50, 550);
  });

  // 设置物体间的碰撞检测
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);

  // 更新状态信号
  activeObjects = objectsGroup.getLength();

  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 保存引用以便在 update 中使用
  this.statusText = statusText;
}

function update() {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText(
      `Active Objects: ${activeObjects}\n` +
      `Collisions: ${collisionCount}`
    );
  }
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

new Phaser.Game(config);