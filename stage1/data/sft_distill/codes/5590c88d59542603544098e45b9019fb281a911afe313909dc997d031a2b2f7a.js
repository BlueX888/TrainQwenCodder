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
  const instructionText = this.add.text(400, 30, '点击画面生成随机颜色的圆形', {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色 (RGB)
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充样式为随机颜色
    graphics.fillStyle(colorHex, 1);
    
    // 在点击位置绘制圆形，半径为 30
    graphics.fillCircle(pointer.x, pointer.y, 30);

    // 可选：添加圆形边框效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(pointer.x, pointer.y, 30);

    // 可选：添加淡入动画效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  });
}

// 启动游戏
new Phaser.Game(config);