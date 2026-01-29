const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -40);      // 顶点
  graphics.lineTo(-35, 30);     // 左下角
  graphics.lineTo(35, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使三角形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 80, 80);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置为可交互并启用拖拽
  triangle.setInteractive({ draggable: true });
  
  // 添加鼠标悬停效果（可选，增强用户体验）
  triangle.on('pointerover', () => {
    triangle.setTint(0xaaaaaa);
  });
  
  triangle.on('pointerout', () => {
    triangle.clearTint();
  });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', (pointer, dragX, dragY) => {
    // 拖拽时放大到 1.2 倍
    triangle.setScale(1.2);
    // 提升显示层级，确保在最上层
    triangle.setDepth(1);
  });
  
  // 监听拖拽过程事件
  triangle.on('drag', (pointer, dragX, dragY) => {
    // 更新三角形位置到鼠标位置
    triangle.x = dragX;
    triangle.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', (pointer, dragX, dragY, dropped) => {
    // 恢复原始大小
    triangle.setScale(1.0);
    // 恢复默认层级
    triangle.setDepth(0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);