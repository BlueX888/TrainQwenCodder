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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  
  // 绘制白色星形（后续通过 tint 改变颜色）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillStar(50, 50, 5, 20, 40, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 添加提示文本
  this.add.text(400, 30, '点击画面生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );
    
    // 在点击位置创建星形
    const star = this.add.image(pointer.x, pointer.y, 'star');
    star.setTint(colorHex);
    
    // 添加缩放动画效果
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);