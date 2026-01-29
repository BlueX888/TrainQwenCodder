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
  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );
    
    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorValue, 1);
    
    // 在点击位置绘制圆形，半径为 30
    graphics.fillCircle(pointer.x, pointer.y, 30);
    
    // 可选：添加描边效果
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(pointer.x, pointer.y, 30);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画面生成圆形', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);