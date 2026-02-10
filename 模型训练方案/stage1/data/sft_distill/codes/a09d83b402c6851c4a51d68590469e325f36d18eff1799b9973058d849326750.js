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
  // 使用 Graphics 绘制粉色星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xffc0cb, 1);
  
  // 绘制星形（中心点在 40, 40，外半径 40，内半径 16，5个角）
  graphics.fillStar(40, 40, 5, 16, 40, 0);
  
  // 生成纹理（80x80 像素）
  graphics.generateTexture('pinkStar', 80, 80);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 监听点击事件
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
  
  // 添加提示文本
  const text = this.add.text(400, 30, 'Click anywhere to create pink stars!', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);