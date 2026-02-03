const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形
  graphics.fillStyle(0x00aaff, 1);
  
  // 菱形的四个顶点（中心在 50, 50，大小 80x80）
  const points = [
    { x: 50, y: 10 },  // 上
    { x: 90, y: 50 },  // 右
    { x: 50, y: 90 },  // 下
    { x: 10, y: 50 }   // 左
  ];
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 添加鼠标悬停效果（可选）
  diamond.on('pointerover', () => {
    diamond.setTint(0xffff00);
  });
  
  diamond.on('pointerout', () => {
    diamond.clearTint();
  });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', (pointer) => {
    // 放大到 1.2 倍
    diamond.setScale(1.2);
    diamond.setTint(0x00ff00);
  });
  
  // 监听拖拽过程事件
  diamond.on('drag', (pointer, dragX, dragY) => {
    // 更新位置
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', (pointer) => {
    // 恢复原大小
    diamond.setScale(1.0);
    diamond.clearTint();
  });
}

new Phaser.Game(config);