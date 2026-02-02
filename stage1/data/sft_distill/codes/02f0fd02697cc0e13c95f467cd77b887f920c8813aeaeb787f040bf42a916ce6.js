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
  // 不需要加载外部资源
}

function create() {
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画面生成随机颜色的矩形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听指针点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
    
    // 生成随机矩形尺寸（宽度和高度在 30-100 之间）
    const width = Phaser.Math.Between(30, 100);
    const height = Phaser.Math.Between(30, 100);
    
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorValue, 1);
    
    // 以点击位置为矩形中心绘制
    graphics.fillRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );
    
    // 可选：添加边框效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );
  });

  // 添加清除按钮
  const clearButton = this.add.text(400, 570, '点击此处清除所有矩形', {
    fontSize: '18px',
    color: '#ffff00',
    backgroundColor: '#333333',
    padding: { x: 10, y: 5 }
  });
  clearButton.setOrigin(0.5);
  clearButton.setInteractive({ useHandCursor: true });
  
  clearButton.on('pointerdown', () => {
    // 清除所有 Graphics 对象（保留文本）
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Graphics) {
        child.destroy();
      }
    });
  });
}

new Phaser.Game(config);