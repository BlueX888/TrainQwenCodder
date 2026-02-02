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
  // 添加提示文字
  this.add.text(400, 30, 'Click anywhere to create circles!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    
    // 在点击位置绘制圆形，半径为 20-40 之间的随机值
    const radius = Phaser.Math.Between(20, 40);
    graphics.fillCircle(pointer.x, pointer.y, radius);

    // 可选：添加简单的缩放动画效果
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);