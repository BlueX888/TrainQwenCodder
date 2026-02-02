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
  // 使用 Graphics 生成粉色星形纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形（中心点在 24, 24，外半径 24，内半径 10，5个角）
  graphics.fillStar(24, 24, 5, 10, 24, 0);
  
  // 生成纹理，大小为 48x48
  graphics.generateTexture('pinkStar', 48, 48);
  
  // 销毁 graphics 对象，释放内存
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成粉色星形', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    const star = this.add.image(pointer.x, pointer.y, 'pinkStar');
    
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