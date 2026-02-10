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

let diamond;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为亮蓝色
  graphics.fillStyle(0x00d4ff, 1);
  
  // 绘制菱形（中心点在 25, 25，尺寸 50x50）
  graphics.beginPath();
  graphics.moveTo(25, 0);    // 上顶点
  graphics.lineTo(50, 25);   // 右顶点
  graphics.lineTo(25, 50);   // 下顶点
  graphics.lineTo(0, 25);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 50, 50);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在场景中心
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置速度：向左下移动（负x，正y）
  diamond.setVelocity(-100, 100);
  
  // 设置相机跟随菱形，保持居中
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 设置世界边界，让菱形可以移动到更大的范围
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加文字提示（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随菱形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  // 添加位置信息文字
  this.positionText = this.add.text(10, 50, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置信息显示
  if (diamond && this.positionText) {
    this.positionText.setText(
      `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
      `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
    );
  }
  
  // 菱形会自动按照设置的速度移动（由物理引擎处理）
  // 相机会自动跟随菱形（由 startFollow 处理）
}

// 创建游戏实例
new Phaser.Game(config);