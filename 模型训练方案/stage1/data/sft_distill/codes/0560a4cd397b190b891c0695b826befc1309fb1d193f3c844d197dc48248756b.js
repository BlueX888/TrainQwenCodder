const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 绘制星形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffa500, 1); // 橙色边框
  
  // 星形的中心点
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 20;
  const innerRadius = 10;
  const points = 5;
  
  // 绘制星形路径
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 扩展世界边界，允许对象移动更远
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建物理精灵对象
  this.star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置星形向右下移动的速度
  this.star.setVelocity(150, 150);
  
  // 设置星形的碰撞边界
  this.star.setCollideWorldBounds(false);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  
  // 让主相机跟随星形对象
  this.cameras.main.startFollow(this.star, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（默认居中）
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加背景网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    gridGraphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加文本提示
  this.infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.infoText.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 更新信息文本显示星形的位置
  if (this.star && this.infoText) {
    this.infoText.setText([
      `Star Position: (${Math.round(this.star.x)}, ${Math.round(this.star.y)})`,
      `Camera Position: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`,
      'Camera is following the star'
    ]);
  }
  
  // 可选：当星形超出边界时重置位置
  if (this.star.x > 2900 || this.star.y > 2900) {
    this.star.setPosition(400, 300);
  }
}

// 创建游戏实例
new Phaser.Game(config);