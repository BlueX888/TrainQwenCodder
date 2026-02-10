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
  // 使用 Graphics 生成方块纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个蓝色方块
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 添加边框使其更明显
  graphics.lineStyle(4, 0x2c5aa0, 1);
  graphics.strokeRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('box', 100, 100);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '拖拽方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建可拖拽的方块
  const box = this.add.sprite(400, 300, 'box');
  
  // 设置为可交互并启用拖拽
  box.setInteractive({ draggable: true });
  
  // 添加鼠标悬停效果
  box.on('pointerover', () => {
    box.setTint(0xaaaaaa);
  });
  
  box.on('pointerout', () => {
    box.clearTint();
  });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  box.on('dragstart', (pointer, dragX, dragY) => {
    box.setScale(1.2);
    box.setTint(0x88ff88); // 拖拽时改变颜色
  });
  
  // 监听拖拽事件 - 更新位置
  box.on('drag', (pointer, dragX, dragY) => {
    box.x = dragX;
    box.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原始大小
  box.on('dragend', (pointer, dragX, dragY) => {
    box.setScale(1);
    box.clearTint();
  });
  
  // 添加状态文本显示
  const statusText = this.add.text(400, 550, '状态: 待拖拽', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 更新状态文本
  box.on('dragstart', () => {
    statusText.setText('状态: 拖拽中 (缩放: 1.2x)');
  });
  
  box.on('dragend', () => {
    statusText.setText('状态: 拖拽结束 (缩放: 1.0x)');
  });
}

new Phaser.Game(config);