const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffdd00, 1);
  graphics.fillStar(64, 64, 5, 32, 60, 0);
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  star.on('dragstart', function(pointer) {
    this.setScale(1.2);
  });
  
  // 监听拖拽中事件 - 更新位置
  star.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原大小
  star.on('dragend', function(pointer) {
    this.setScale(1.0);
  });
  
  // 添加鼠标悬停效果（可选）
  star.on('pointerover', function() {
    if (this.scale === 1.0) {
      this.setTint(0xffaa00);
    }
  });
  
  star.on('pointerout', function() {
    this.clearTint();
  });
}

new Phaser.Game(config);