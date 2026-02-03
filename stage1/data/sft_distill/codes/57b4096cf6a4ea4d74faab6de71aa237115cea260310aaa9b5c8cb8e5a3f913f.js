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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(4, 0xffa500, 1);
  
  // 绘制星形（中心点在 60, 60，半径 50）
  graphics.fillStar(60, 60, 5, 20, 50);
  graphics.strokeStar(60, 60, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('star', 120, 120);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  star.on('dragstart', (pointer) => {
    star.setScale(1.2);
  });
  
  // 监听拖拽中事件 - 更新位置
  star.on('drag', (pointer, dragX, dragY) => {
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原始大小
  star.on('dragend', (pointer) => {
    star.setScale(1.0);
  });
  
  // 添加鼠标悬停效果（可选）
  star.on('pointerover', () => {
    if (!star.input.isDragging) {
      star.setTint(0xffaaaa);
    }
  });
  
  star.on('pointerout', () => {
    star.clearTint();
  });
}

new Phaser.Game(config);