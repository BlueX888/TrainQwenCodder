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
  // 无需预加载外部资源
}

function create() {
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画面生成随机颜色的圆形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（RGB）
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 生成随机半径（20-50像素）
    const radius = Phaser.Math.Between(20, 50);

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    graphics.fillCircle(pointer.x, pointer.y, radius);

    // 可选：添加描边效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(pointer.x, pointer.y, radius);

    // 可选：添加淡入动画效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加额外说明
  const hint = this.add.text(400, 570, '圆形大小随机，颜色随机', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  hint.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);