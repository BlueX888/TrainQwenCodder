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
  this.add.text(400, 30, '点击画面生成随机颜色的椭圆', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色 (0x000000 到 0xffffff)
    const randomColor = Math.floor(Math.random() * 0xffffff);
    
    // 生成随机椭圆尺寸
    const radiusX = 30 + Math.random() * 50; // 30-80
    const radiusY = 20 + Math.random() * 40; // 20-60
    
    // 创建 Graphics 对象绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置填充颜色和透明度
    graphics.fillStyle(randomColor, 0.8);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    graphics.fillEllipse(pointer.x, pointer.y, radiusX * 2, radiusY * 2);
    
    // 可选：添加描边效果
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeEllipse(pointer.x, pointer.y, radiusX * 2, radiusY * 2);
    
    // 输出调试信息
    console.log(`椭圆已生成 - 位置: (${pointer.x}, ${pointer.y}), 颜色: #${randomColor.toString(16).padStart(6, '0')}`);
  });
}

// 启动游戏
new Phaser.Game(config);