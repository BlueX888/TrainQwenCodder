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
  const graphics = this.add.graphics();
  
  // 绘制一个蓝色方块
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 添加边框效果
  graphics.lineStyle(4, 0x2c5f8d, 1);
  graphics.strokeRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('box', 100, 100);
  graphics.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, '拖拽方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建可拖拽的方块
  const box = this.add.sprite(400, 300, 'box');
  
  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });
  
  // 添加鼠标悬停效果（可选）
  box.on('pointerover', function() {
    this.setTint(0xaaaaaa);
  });
  
  box.on('pointerout', function() {
    this.clearTint();
  });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  box.on('dragstart', function(pointer) {
    this.setScale(1.2);
    this.setTint(0xffff00); // 拖拽时添加黄色高亮
  });
  
  // 监听拖拽过程 - 更新位置
  box.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原始大小
  box.on('dragend', function(pointer) {
    this.setScale(1.0);
    this.clearTint(); // 清除高亮
  });
  
  // 添加调试信息（可选）
  const debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#00ff00'
  });
  
  // 更新调试信息
  this.input.on('drag', function(pointer, gameObject, dragX, dragY) {
    debugText.setText([
      `位置: (${Math.round(dragX)}, ${Math.round(dragY)})`,
      `缩放: ${gameObject.scale}`
    ]);
  });
}

new Phaser.Game(config);