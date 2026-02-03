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
  this.add.text(400, 30, '点击画面生成随机颜色的矩形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 注册鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（RGB格式）
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 生成随机矩形尺寸（宽度30-100，高度30-100）
    const width = Phaser.Math.Between(30, 100);
    const height = Phaser.Math.Between(30, 100);

    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    
    // 在点击位置绘制矩形（以点击点为中心）
    graphics.fillRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );

    // 可选：添加边框效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );

    // 可选：添加淡入效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  });

  // 添加额外说明
  this.add.text(400, 570, '每次点击生成不同颜色和大小的矩形', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);