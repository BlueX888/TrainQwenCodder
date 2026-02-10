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
  // 使用 Graphics 创建蓝色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 60, 60);
  graphics.generateTexture('blueRect', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建蓝色矩形精灵，初始位置在左侧
  const rectangle = this.add.sprite(100, 300, 'blueRect');
  
  // 创建补间动画：4秒从左移到右，yoyo往返，无限循环
  this.tweens.add({
    targets: rectangle,
    x: 700,                    // 目标位置（右侧）
    duration: 4000,            // 4秒完成单程
    ease: 'Linear',            // 线性移动
    yoyo: true,                // 往返效果
    repeat: -1                 // 无限循环（-1表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Blue rectangle moving left-right (4s loop)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);