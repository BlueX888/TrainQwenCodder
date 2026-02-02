const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(4, 0xffa500, 1);
  
  // 绘制星形 (中心点为 64, 64，半径为 50)
  graphics.fillStar(64, 64, 5, 50, 25);
  graphics.strokeStar(64, 64, 5, 50, 25);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
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
  
  // 监听拖拽开始事件
  star.on('dragstart', (pointer) => {
    // 放大到 1.2 倍
    star.setScale(1.2);
    // 可选：改变透明度以增强视觉效果
    star.setAlpha(0.8);
  });
  
  // 监听拖拽过程事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置跟随鼠标
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', (pointer) => {
    // 恢复原始大小
    star.setScale(1);
    // 恢复透明度
    star.setAlpha(1);
  });
  
  // 添加鼠标悬停效果（可选）
  star.on('pointerover', () => {
    if (!star.input.dragState) {
      star.setTint(0xffaaaa);
    }
  });
  
  star.on('pointerout', () => {
    star.clearTint();
  });
}

new Phaser.Game(config);