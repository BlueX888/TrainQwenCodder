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
}

/**
 * 在指定位置创建白色菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心 x 坐标
 * @param {number} y - 菱形中心 y 坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 菱形尺寸为 48 像素，计算四个顶点坐标
  const size = 48;
  const halfSize = size / 2;
  
  // 菱形的四个顶点（相对于中心点）
  const points = [
    { x: x, y: y - halfSize },           // 上顶点
    { x: x + halfSize, y: y },           // 右顶点
    { x: x, y: y + halfSize },           // 下顶点
    { x: x - halfSize, y: y }            // 左顶点
  ];
  
  // 绘制填充的菱形
  graphics.fillPoints(points, true);
}

new Phaser.Game(config);