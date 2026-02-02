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

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色 (0x000000 到 0xffffff)
    const randomColor = Phaser.Math.Between(0x000000, 0xffffff);
    
    // 生成随机椭圆尺寸
    const radiusX = Phaser.Math.Between(30, 80);
    const radiusY = Phaser.Math.Between(20, 60);
    
    // 创建新的 Graphics 对象来绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置填充样式
    graphics.fillStyle(randomColor, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, radiusX, radiusY)
    graphics.fillEllipse(pointer.x, pointer.y, radiusX, radiusY);
    
    // 可选：添加描边效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeEllipse(pointer.x, pointer.y, radiusX, radiusY);
    
    // 输出调试信息
    console.log(`生成椭圆 - 位置: (${pointer.x}, ${pointer.y}), 颜色: #${randomColor.toString(16).padStart(6, '0')}`);
  });
  
  // 添加计数器显示已生成的椭圆数量
  let ellipseCount = 0;
  const countText = this.add.text(10, 10, '椭圆数量: 0', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  this.input.on('pointerdown', () => {
    ellipseCount++;
    countText.setText(`椭圆数量: ${ellipseCount}`);
  });
}

new Phaser.Game(config);