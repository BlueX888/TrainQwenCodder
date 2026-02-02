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
  this.add.text(400, 50, 'Click anywhere to create diamonds!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个随机颜色的菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 */
function createDiamond(scene, x, y) {
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const colorValue = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(colorValue, 1);
  
  // 菱形大小参数
  const size = 40;
  
  // 绘制菱形路径
  graphics.beginPath();
  graphics.moveTo(x, y - size);        // 上顶点
  graphics.lineTo(x + size, y);        // 右顶点
  graphics.lineTo(x, y + size);        // 下顶点
  graphics.lineTo(x - size, y);        // 左顶点
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 可选：添加描边效果
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePath();
}

// 启动游戏
new Phaser.Game(config);