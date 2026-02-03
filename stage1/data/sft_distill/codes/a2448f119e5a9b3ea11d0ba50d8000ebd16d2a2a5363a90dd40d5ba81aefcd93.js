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
  this.add.text(400, 300, '点击画布任意位置生成红色菱形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建红色菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心 x 坐标
 * @param {number} y - 菱形中心 y 坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 菱形尺寸（从中心到顶点的距离）
  const size = 40; // 总宽高为 80 像素
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 菱形四个顶点坐标（相对于中心点）
  // 上顶点
  graphics.moveTo(x, y - size);
  // 右顶点
  graphics.lineTo(x + size, y);
  // 下顶点
  graphics.lineTo(x, y + size);
  // 左顶点
  graphics.lineTo(x - size, y);
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

// 创建游戏实例
new Phaser.Game(config);