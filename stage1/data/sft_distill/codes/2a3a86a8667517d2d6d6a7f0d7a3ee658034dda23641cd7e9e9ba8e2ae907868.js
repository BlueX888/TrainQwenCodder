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
  this.add.text(400, 30, '点击画面生成菱形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const color = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制菱形
    const graphics = this.add.graphics();
    
    // 设置填充颜色
    graphics.fillStyle(color, 1);
    
    // 菱形大小
    const size = 40;
    
    // 绘制菱形路径（四个顶点）
    graphics.beginPath();
    graphics.moveTo(pointer.x, pointer.y - size); // 上顶点
    graphics.lineTo(pointer.x + size, pointer.y); // 右顶点
    graphics.lineTo(pointer.x, pointer.y + size); // 下顶点
    graphics.lineTo(pointer.x - size, pointer.y); // 左顶点
    graphics.closePath();
    
    // 填充菱形
    graphics.fillPath();
    
    // 添加描边使菱形更明显
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokePath();
  });
}

new Phaser.Game(config);