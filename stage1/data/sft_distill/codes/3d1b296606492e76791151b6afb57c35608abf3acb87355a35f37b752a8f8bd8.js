const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 使用 Graphics 绘制粉色星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  // 星形中心点设置为 24,24（纹理尺寸的一半），这样星形居中
  graphics.fillStar(24, 24, 5, 10, 24);
  
  // 生成 48x48 的纹理
  graphics.generateTexture('pinkStar', 48, 48);
  
  // 销毁 graphics 对象，释放内存
  graphics.destroy();
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形精灵
    const star = this.add.sprite(pointer.x, pointer.y, 'pinkStar');
    
    // 可选：添加一些视觉效果，让星形出现时有缩放动画
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成粉色星形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);