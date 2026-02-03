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
  this.add.text(400, 30, '点击画面生成六边形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createHexagon(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建六边形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - 中心点X坐标
 * @param {number} y - 中心点Y坐标
 */
function createHexagon(scene, x, y) {
  // 六边形参数
  const radius = 40; // 外接圆半径
  const sides = 6;
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从-30度开始，每60度一个顶点
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(px, py));
  }
  
  // 创建多边形对象
  const hexagon = new Phaser.Geom.Polygon(points);
  
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const color = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 使用 Graphics 绘制六边形
  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillPoints(hexagon.points, true);
  
  // 添加描边使六边形更清晰
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePoints(hexagon.points, true);
  
  // 设置位置
  graphics.setPosition(x, y);
  
  // 添加简单的缩放动画效果
  graphics.setScale(0);
  scene.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
}

// 启动游戏
new Phaser.Game(config);