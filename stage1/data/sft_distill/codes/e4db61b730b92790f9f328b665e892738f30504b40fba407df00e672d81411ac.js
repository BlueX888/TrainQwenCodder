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

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    createHexagon(this, pointer.x, pointer.y);
  });
}

/**
 * 创建六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const color = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 六边形参数
  const radius = 40; // 半径
  const points = [];
  
  // 计算六边形的6个顶点坐标
  // 六边形每个角度间隔 60 度（Math.PI / 3）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始绘制
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(px, py);
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使六边形更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePath();
  
  // 添加简单的缩放动画效果
  graphics.setScale(0);
  scene.tweens.add({
    targets: graphics,
    scaleX: 1,
    scaleY: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
}

new Phaser.Game(config);