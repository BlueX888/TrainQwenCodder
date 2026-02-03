const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
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
  this.add.text(10, 10, 'Click anywhere to create a red diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

/**
 * 在指定位置创建菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 菱形中心 X 坐标
 * @param {number} y - 菱形中心 Y 坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 菱形尺寸为 80 像素（从中心到顶点的距离为 40 像素）
  const halfSize = 40;
  
  // 创建菱形路径
  const diamond = new Phaser.Geom.Polygon([
    x, y - halfSize,           // 上顶点
    x + halfSize, y,           // 右顶点
    x, y + halfSize,           // 下顶点
    x - halfSize, y            // 左顶点
  ]);
  
  // 填充菱形
  graphics.fillPoints(diamond.points, true);
}

// 启动游戏
new Phaser.Game(config);