const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形 (中心点在 12,12，外半径12，内半径5，5个角)
  graphics.fillStar(12, 12, 5, 12, 5, 0);
  
  // 生成 24x24 的纹理
  graphics.generateTexture('star', 24, 24);
  
  // 销毁 graphics 对象，释放资源
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a yellow star!', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    const star = this.add.image(pointer.x, pointer.y, 'star');
    
    // 可选：添加简单的缩放动画效果
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);