const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '点击画布任意位置生成紫色菱形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个16像素的紫色菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心X坐标
 * @param {number} y - 菱形中心Y坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x800080, 1);
  
  // 绘制菱形路径
  // 菱形是一个旋转45度的正方形，边长16像素
  // 从中心点向上下左右各延伸8像素
  graphics.beginPath();
  graphics.moveTo(x, y - 8);      // 上顶点
  graphics.lineTo(x + 8, y);      // 右顶点
  graphics.lineTo(x, y + 8);      // 下顶点
  graphics.lineTo(x - 8, y);      // 左顶点
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);