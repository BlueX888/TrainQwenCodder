const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加提示文字
  this.add.text(400, 30, '点击画面生成菱形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
}

function update(time, delta) {
  // 本示例无需更新逻辑
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
  const colorValue = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 菱形大小参数
  const width = 40 + Math.random() * 40;  // 宽度：40-80
  const height = 40 + Math.random() * 40; // 高度：40-80
  
  // 设置填充样式
  graphics.fillStyle(colorValue, 1);
  
  // 绘制菱形路径
  // 菱形四个顶点：上、右、下、左
  graphics.beginPath();
  graphics.moveTo(x, y - height / 2);           // 上顶点
  graphics.lineTo(x + width / 2, y);            // 右顶点
  graphics.lineTo(x, y + height / 2);           // 下顶点
  graphics.lineTo(x - width / 2, y);            // 左顶点
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 可选：添加描边
  graphics.lineStyle(2, 0xffffff, 0.5);
  graphics.strokePath();
}

new Phaser.Game(config);