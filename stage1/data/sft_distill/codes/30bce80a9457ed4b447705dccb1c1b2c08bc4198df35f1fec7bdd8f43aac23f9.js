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
  // 添加标题文本提示
  this.add.text(400, 30, 'Click anywhere to create circles!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（RGB格式）
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充样式
    graphics.fillStyle(colorValue, 1);
    
    // 在点击位置绘制圆形（半径为20像素）
    graphics.fillCircle(pointer.x, pointer.y, 20);
    
    // 可选：添加边框使圆形更明显
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(pointer.x, pointer.y, 20);
  });
}

// 创建游戏实例
new Phaser.Game(config);