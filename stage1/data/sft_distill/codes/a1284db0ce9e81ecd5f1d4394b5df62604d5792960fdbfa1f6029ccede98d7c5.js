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
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形（中心点在 24,24，外半径 24，内半径 12，5个角）
  graphics.fillStar(24, 24, 5, 12, 24, 0);
  
  // 生成 48x48 的纹理
  graphics.generateTexture('star', 48, 48);
  
  // 销毁 graphics 对象，释放资源
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 20, '点击画布任意位置生成粉色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形
    const star = this.add.image(pointer.x, pointer.y, 'star');
    
    // 可选：添加一些动画效果让星形更生动
    this.tweens.add({
      targets: star,
      scale: { from: 0, to: 1 },
      alpha: { from: 0.5, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);