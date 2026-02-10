const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('rectTexture', 100, 80);
  graphics.destroy();
}

function create() {
  // 创建可拖拽的矩形
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 设置交互属性
  rect.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽矩形试试', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件
  rect.on('dragstart', (pointer, dragX, dragY) => {
    // 放大到 1.2 倍
    rect.setScale(1.2);
    // 提升层级，确保在最上层
    rect.setDepth(1);
  });
  
  // 监听拖拽中事件
  rect.on('drag', (pointer, dragX, dragY) => {
    // 更新矩形位置跟随鼠标
    rect.x = dragX;
    rect.y = dragY;
  });
  
  // 监听拖拽结束事件
  rect.on('dragend', (pointer, dragX, dragY) => {
    // 恢复原大小
    rect.setScale(1);
    // 恢复层级
    rect.setDepth(0);
  });
  
  // 添加鼠标悬停效果（可选）
  rect.on('pointerover', () => {
    rect.setTint(0x88ccff);
  });
  
  rect.on('pointerout', () => {
    rect.clearTint();
  });
}

new Phaser.Game(config);