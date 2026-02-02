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
  this.add.text(400, 30, '点击画面生成菱形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
}

/**
 * 创建菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 */
function createDiamond(scene, x, y) {
  // 生成随机颜色
  const color = Phaser.Display.Color.RandomRGB();
  const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
  
  // 菱形尺寸
  const width = 40;
  const height = 60;
  
  // 创建 Graphics 对象绘制菱形
  const graphics = scene.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(hexColor, 1);
  
  // 绘制菱形路径（四个顶点）
  graphics.beginPath();
  graphics.moveTo(x, y - height / 2);        // 上顶点
  graphics.lineTo(x + width / 2, y);         // 右顶点
  graphics.lineTo(x, y + height / 2);        // 下顶点
  graphics.lineTo(x - width / 2, y);         // 左顶点
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 添加描边效果，使菱形更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.beginPath();
  graphics.moveTo(x, y - height / 2);
  graphics.lineTo(x + width / 2, y);
  graphics.lineTo(x, y + height / 2);
  graphics.lineTo(x - width / 2, y);
  graphics.closePath();
  graphics.strokePath();
}

// 启动游戏
new Phaser.Game(config);