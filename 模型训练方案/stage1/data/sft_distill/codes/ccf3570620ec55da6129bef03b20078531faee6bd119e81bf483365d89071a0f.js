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
  const text = this.add.text(400, 30, '点击画面生成菱形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个随机颜色的菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心 x 坐标
 * @param {number} y - 菱形中心 y 坐标
 */
function createDiamond(scene, x, y) {
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const color = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(color, 1);
  
  // 菱形尺寸
  const size = 40;
  
  // 绘制菱形路径（四个顶点：上、右、下、左）
  graphics.beginPath();
  graphics.moveTo(x, y - size);        // 上顶点
  graphics.lineTo(x + size, y);        // 右顶点
  graphics.lineTo(x, y + size);        // 下顶点
  graphics.lineTo(x - size, y);        // 左顶点
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePath();
}

// 创建游戏实例
new Phaser.Game(config);