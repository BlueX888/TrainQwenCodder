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
let objectCount = 12;
let activeObjects = 0;

function preload() {
  // 使用 Graphics 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('redBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const redObjects = this.physics.add.group({
    key: 'redBall',
    repeat: 11, // 创建12个物体（0-11）
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 为每个物体设置随机速度和反弹
  redObjects.children.iterate((child) => {
    // 随机角度
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 160;
    
    // 根据角度设置速度分量
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    child.setVelocity(vx, vy);
    child.setBounce(1, 1); // 完全弹性碰撞
    child.setCollideWorldBounds(true); // 与世界边界碰撞
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(redObjects, redObjects, onCollision, null, this);

  // 更新活跃对象数量
  activeObjects = redObjects.getLength();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(10, 570, '12个红色物体以160速度随机移动并碰撞反弹', {
    fontSize: '14px',
    fill: '#cccccc'
  });
}

function update() {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText(
      `对象数量: ${objectCount}\n` +
      `活跃对象: ${activeObjects}\n` +
      `碰撞次数: ${collisionCount}`
    );
  }
}

function onCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
  
  // 可选：添加碰撞视觉反馈
  obj1.setTint(0xffaaaa);
  obj2.setTint(0xffaaaa);
  
  // 短暂延迟后恢复颜色
  setTimeout(() => {
    obj1.clearTint();
    obj2.clearTint();
  }, 100);
}

new Phaser.Game(config);