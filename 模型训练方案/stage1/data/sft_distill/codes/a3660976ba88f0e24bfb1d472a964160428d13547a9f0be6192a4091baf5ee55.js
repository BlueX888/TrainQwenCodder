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
  const text = this.add.text(400, 30, '点击画面生成随机颜色方块', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（RGB格式）
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 方块大小
    const boxSize = 50;

    // 使用 Graphics 绘制方块
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    graphics.fillRect(
      pointer.x - boxSize / 2,
      pointer.y - boxSize / 2,
      boxSize,
      boxSize
    );

    // 添加边框使方块更明显
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(
      pointer.x - boxSize / 2,
      pointer.y - boxSize / 2,
      boxSize,
      boxSize
    );

    // 可选：添加简单的缩放动画效果
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // 输出方块信息到控制台
    console.log(`生成方块 - 位置: (${Math.round(pointer.x)}, ${Math.round(pointer.y)}), 颜色: #${colorHex.toString(16).padStart(6, '0')}`);
  });
}

new Phaser.Game(config);