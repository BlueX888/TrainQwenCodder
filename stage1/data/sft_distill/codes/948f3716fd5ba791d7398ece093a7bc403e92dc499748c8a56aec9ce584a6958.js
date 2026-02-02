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
  // 无需预加载资源
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, 'Click anywhere to create ellipses!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色 (RGB)
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充样式
    graphics.fillStyle(colorHex, 1);
    
    // 生成随机椭圆尺寸 (宽度: 40-120, 高度: 30-100)
    const radiusX = Phaser.Math.Between(40, 120);
    const radiusY = Phaser.Math.Between(30, 100);
    
    // 在点击位置绘制椭圆
    graphics.fillEllipse(pointer.x, pointer.y, radiusX, radiusY);
    
    // 可选：添加淡入效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  });
}

new Phaser.Game(config);