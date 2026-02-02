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
  const text = this.add.text(400, 30, '点击画面生成随机颜色的椭圆', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色 (RGB格式的16进制数)
    const randomColor = Phaser.Math.Between(0x000000, 0xffffff);
    
    // 生成随机椭圆尺寸
    const radiusX = Phaser.Math.Between(30, 80);
    const radiusY = Phaser.Math.Between(20, 60);
    
    // 创建新的 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充样式
    graphics.fillStyle(randomColor, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    graphics.fillEllipse(pointer.x, pointer.y, radiusX * 2, radiusY * 2);
    
    // 可选：添加边框
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeEllipse(pointer.x, pointer.y, radiusX * 2, radiusY * 2);
  });
}

// 启动游戏
new Phaser.Game(config);