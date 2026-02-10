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
  const instructionText = this.add.text(400, 30, 'Click anywhere to create rectangles!', {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
    
    // 生成随机矩形尺寸（宽度和高度在 40-100 之间）
    const width = Phaser.Math.Between(40, 100);
    const height = Phaser.Math.Between(40, 100);
    
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorValue, 1);
    
    // 以点击点为中心绘制矩形
    graphics.fillRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );
    
    // 可选：添加边框使矩形更明显
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
    
    // 在控制台输出信息（用于调试）
    console.log(`Rectangle created at (${pointer.x}, ${pointer.y}) with color RGB(${randomColor.r}, ${randomColor.g}, ${randomColor.b})`);
  });
}

// 启动游戏
new Phaser.Game(config);