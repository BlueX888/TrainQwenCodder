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
  // 创建一个更大的世界边界，让六边形可以移动
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 绘制六边形（使用路径绘制正六边形）
  const hexRadius = 30;
  const centerX = 32;
  const centerY = 32;
  
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  // 绘制正六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框使六边形更明显
  graphics.lineStyle(3, 0xffff00, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy();
  
  // 创建六边形精灵，放置在屏幕中央
  this.hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置六边形向右移动的速度
  this.hexagon.setVelocityX(150);
  
  // 设置六边形的碰撞边界（确保不会离开世界边界）
  this.hexagon.setCollideWorldBounds(false);
  
  // 设置相机跟随六边形
  this.cameras.main.startFollow(this.hexagon, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 添加背景网格以显示移动效果
  this.createBackgroundGrid();
  
  // 添加文本提示
  const text = this.add.text(10, 10, '相机跟随六边形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 可选：添加旋转效果使六边形更生动
  this.hexagon.rotation += 0.02;
  
  // 当六边形到达世界边界时，可以选择重置位置或停止
  if (this.hexagon.x > 2900) {
    this.hexagon.setVelocityX(0);
    
    // 添加完成提示
    if (!this.completedText) {
      this.completedText = this.add.text(400, 300, '到达终点！', {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      });
      this.completedText.setOrigin(0.5);
    }
  }
}

// 辅助函数：创建背景网格以显示相机移动效果
function createBackgroundGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineTo(x, 0);
    graphics.lineTo(x, 600);
    graphics.moveTo(x + 100, 0);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  
  graphics.strokePath();
  
  // 添加位置标记
  for (let x = 0; x <= 3000; x += 500) {
    const marker = this.add.text(x, 20, `X: ${x}`, {
      fontSize: '14px',
      color: '#888888'
    });
  }
}

// 启动游戏
new Phaser.Game(config);