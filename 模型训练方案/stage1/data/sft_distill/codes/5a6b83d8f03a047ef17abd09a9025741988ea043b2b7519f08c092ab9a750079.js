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

let hexagonCount = 0;
const MAX_HEXAGONS = 3;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  createHexagonTexture(this);
  
  // 添加定时器事件，每2秒生成一个六边形
  this.time.addEvent({
    delay: 2000,                    // 2秒间隔
    callback: spawnHexagon,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: MAX_HEXAGONS - 1        // 重复2次（加上首次共3次）
  });
}

/**
 * 创建六边形纹理
 */
function createHexagonTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 六边形参数
  const radius = 30;
  const sides = 6;
  const hexagonPoints = [];
  
  // 计算六边形的顶点
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 每60度一个顶点，旋转30度使其平顶
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexagonPoints.push(new Phaser.Geom.Point(x, y));
  }
  
  // 创建多边形
  const hexagon = new Phaser.Geom.Polygon(hexagonPoints);
  
  // 绘制紫色六边形
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillPoints(hexagon.points, true);
  
  // 添加描边
  graphics.lineStyle(2, 0x8e44ad, 1); // 深紫色描边
  graphics.strokePoints(hexagon.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

/**
 * 在随机位置生成六边形
 */
function spawnHexagon() {
  if (hexagonCount >= MAX_HEXAGONS) {
    return;
  }
  
  // 生成随机位置（留出边距避免六边形超出屏幕）
  const margin = 40;
  const x = Phaser.Math.Between(margin, config.width - margin);
  const y = Phaser.Math.Between(margin, config.height - margin);
  
  // 创建六边形精灵
  const hexagon = this.add.image(x, y, 'hexagon');
  
  // 添加缩放动画效果
  hexagon.setScale(0);
  this.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  hexagonCount++;
  
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);