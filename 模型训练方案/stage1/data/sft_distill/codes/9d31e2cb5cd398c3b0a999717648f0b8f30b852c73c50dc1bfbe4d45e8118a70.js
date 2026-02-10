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
  const instructionText = this.add.text(400, 50, '点击画面生成方块', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);

  // 监听屏幕点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
    
    // 方块尺寸
    const boxSize = 50;
    
    // 使用 Graphics 绘制方块
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    graphics.fillRect(pointer.x - boxSize / 2, pointer.y - boxSize / 2, boxSize, boxSize);
    
    // 添加边框使方块更明显
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(pointer.x - boxSize / 2, pointer.y - boxSize / 2, boxSize, boxSize);
    
    // 可选：添加点击反馈音效（使用控制台输出模拟）
    console.log(`方块已生成在 (${Math.round(pointer.x)}, ${Math.round(pointer.y)})，颜色: RGB(${randomColor.r}, ${randomColor.g}, ${randomColor.b})`);
  });

  // 添加方块计数器
  let boxCount = 0;
  const counterText = this.add.text(400, 550, '已生成方块: 0', {
    fontSize: '18px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  counterText.setOrigin(0.5);

  // 更新计数器
  this.input.on('pointerdown', () => {
    boxCount++;
    counterText.setText(`已生成方块: ${boxCount}`);
  });
}

// 启动游戏
new Phaser.Game(config);