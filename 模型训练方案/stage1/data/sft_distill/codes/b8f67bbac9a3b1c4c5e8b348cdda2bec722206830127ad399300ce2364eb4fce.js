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
  const text = this.add.text(400, 30, '点击画面生成随机颜色的圆形', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（RGB格式）
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充样式并绘制圆形
    graphics.fillStyle(colorHex, 1);
    graphics.fillCircle(pointer.x, pointer.y, 30); // 半径为30像素

    // 可选：添加描边效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(pointer.x, pointer.y, 30);
  });

  // 添加额外提示
  const hint = this.add.text(400, 570, '每个圆形半径30像素，带白色描边', {
    fontSize: '14px',
    color: '#aaaaaa'
  });
  hint.setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);