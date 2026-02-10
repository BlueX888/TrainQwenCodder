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
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建粉色星形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillStar(64, 64, 5, 32, 60, 0); // 中心点(64,64), 5个角, 内半径32, 外半径60
  pinkGraphics.generateTexture('pinkStar', 128, 128);
  pinkGraphics.destroy();
  
  // 创建黄色星形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillStar(64, 64, 5, 32, 60, 0);
  yellowGraphics.generateTexture('yellowStar', 128, 128);
  yellowGraphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'pinkStar');
  
  // 启用拖拽交互
  star.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖动星星试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  star.on('dragstart', (pointer) => {
    // 改变为黄色
    star.setTexture('yellowStar');
    // 增加缩放效果
    star.setScale(1.1);
    hintText.setText('拖拽中...');
  });
  
  // 监听拖拽移动事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', (pointer) => {
    // 恢复粉色
    star.setTexture('pinkStar');
    // 恢复缩放
    star.setScale(1);
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    hintText.setText('拖动星星试试！');
  });
  
  // 添加悬停效果
  star.on('pointerover', () => {
    star.setScale(1.05);
  });
  
  star.on('pointerout', () => {
    // 只在非拖拽状态下恢复缩放
    if (!this.input.dragState) {
      star.setScale(1);
    }
  });
}

new Phaser.Game(config);