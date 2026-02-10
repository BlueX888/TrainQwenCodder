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
  this.add.text(400, 50, '点击画面生成随机颜色方块', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画面点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = getRandomColor();
    
    // 创建方块 Graphics
    const graphics = this.add.graphics();
    
    // 设置填充颜色和透明度
    graphics.fillStyle(randomColor, 1);
    
    // 在点击位置绘制方块（50x50 像素，居中对齐）
    const squareSize = 50;
    graphics.fillRect(
      pointer.x - squareSize / 2,
      pointer.y - squareSize / 2,
      squareSize,
      squareSize
    );
    
    // 添加边框使方块更明显
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeRect(
      pointer.x - squareSize / 2,
      pointer.y - squareSize / 2,
      squareSize,
      squareSize
    );
    
    // 可选：添加点击坐标文本
    this.add.text(pointer.x, pointer.y, `(${Math.floor(pointer.x)}, ${Math.floor(pointer.y)})`, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000'
    }).setOrigin(0.5);
  });
}

/**
 * 生成随机颜色（十六进制格式）
 * @returns {number} 0x000000 到 0xFFFFFF 之间的随机颜色值
 */
function getRandomColor() {
  return Phaser.Math.Between(0x000000, 0xffffff);
}

// 创建游戏实例
new Phaser.Game(config);