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
  // 本示例不需要预加载外部资源
}

function create() {
  // 添加提示文字
  const text = this.add.text(400, 30, '点击画面生成随机颜色的椭圆', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（RGB 转换为十六进制）
    const randomColor = Phaser.Display.Color.RandomRGB();
    const color = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);

    // 创建新的 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充样式
    graphics.fillStyle(color, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 椭圆大小随机在 40-100 之间
    const width = Phaser.Math.Between(40, 100);
    const height = Phaser.Math.Between(40, 100);
    
    graphics.fillEllipse(pointer.x, pointer.y, width, height);

    // 可选：添加淡入效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });

    // 输出调试信息
    console.log(`椭圆已生成 - 位置: (${pointer.x}, ${pointer.y}), 颜色: #${color.toString(16).padStart(6, '0')}, 尺寸: ${width}x${height}`);
  });
}

// 启动游戏
new Phaser.Game(config);