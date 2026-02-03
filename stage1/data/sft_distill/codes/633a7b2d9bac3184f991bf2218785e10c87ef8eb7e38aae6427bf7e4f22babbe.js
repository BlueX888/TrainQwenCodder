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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a white diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

/**
 * 在指定位置创建一个白色菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心 x 坐标
 * @param {number} y - 菱形中心 y 坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 菱形大小（从中心到顶点的距离）
  const size = 16; // 32像素菱形，半径为16
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制菱形的四个顶点（上、右、下、左）
  graphics.moveTo(x, y - size);        // 上顶点
  graphics.lineTo(x + size, y);        // 右顶点
  graphics.lineTo(x, y + size);        // 下顶点
  graphics.lineTo(x - size, y);        // 左顶点
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);