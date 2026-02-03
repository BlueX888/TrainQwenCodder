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
  this.add.text(400, 300, '点击任意位置生成紫色菱形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建紫色菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心x坐标
 * @param {number} y - 菱形中心y坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 定义菱形的四个顶点（16像素大小，即从中心到边缘8像素）
  const size = 8; // 半径
  const points = [
    { x: x, y: y - size },      // 上顶点
    { x: x + size, y: y },      // 右顶点
    { x: x, y: y + size },      // 下顶点
    { x: x - size, y: y }       // 左顶点
  ];
  
  // 绘制填充的菱形
  graphics.fillPoints(points, true);
}

new Phaser.Game(config);