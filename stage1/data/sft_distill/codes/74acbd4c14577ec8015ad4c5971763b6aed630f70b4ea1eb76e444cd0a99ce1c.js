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
  // 添加标题提示
  const title = this.add.text(400, 30, '点击画面生成随机颜色的圆形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  title.setOrigin(0.5);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);

    // 创建新的 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    
    // 在点击位置绘制圆形，半径为 30
    graphics.fillCircle(pointer.x, pointer.y, 30);

    // 可选：添加圆形边框使其更明显
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(pointer.x, pointer.y, 30);
  });

  // 添加使用说明
  const instruction = this.add.text(400, 570, '提示：点击任意位置生成圆形', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  instruction.setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);