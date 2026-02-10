const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 记录星形初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 绘制白色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制白色星形
  graphics.fillStyle(0xffffff, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('whiteStar', 128, 128);
  graphics.clear();
  
  // 绘制黄色星形纹理（拖拽时使用）
  graphics.fillStyle(0xffff00, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('yellowStar', 128, 128);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'whiteStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 添加鼠标悬停效果
  star.on('pointerover', () => {
    star.setScale(1.1);
  });
  
  star.on('pointerout', () => {
    star.setScale(1.0);
  });
  
  // 监听拖拽开始事件
  star.on('dragstart', (pointer) => {
    // 拖拽时改变为黄色
    star.setTexture('yellowStar');
    star.setScale(1.2);
  });
  
  // 监听拖拽中事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置跟随鼠标
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', (pointer) => {
    // 恢复为白色
    star.setTexture('whiteStar');
    star.setScale(1.0);
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);