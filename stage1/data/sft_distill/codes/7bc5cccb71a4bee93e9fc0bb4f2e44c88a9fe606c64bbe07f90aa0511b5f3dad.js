const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建红色三角形
    createTriangle(this, pointer.x, pointer.y);
  });

  // 添加提示文字
  this.add.text(400, 300, '点击画布任意位置生成红色三角形', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建一个48像素的红色三角形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createTriangle(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制等边三角形（48像素边长）
  // 三角形顶点坐标计算：
  // 顶点1: (0, -高度的2/3)
  // 顶点2: (-边长/2, 高度的1/3)
  // 顶点3: (边长/2, 高度的1/3)
  const size = 48;
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  graphics.beginPath();
  graphics.moveTo(x, y - height * 2 / 3); // 顶部顶点
  graphics.lineTo(x - size / 2, y + height / 3); // 左下顶点
  graphics.lineTo(x + size / 2, y + height / 3); // 右下顶点
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);