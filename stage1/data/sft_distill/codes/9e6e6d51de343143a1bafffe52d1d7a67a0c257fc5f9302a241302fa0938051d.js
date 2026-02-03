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
const MAX_HEXAGONS = 15;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  hexagonCount = 0;
  
  // 创建青色六边形纹理
  createHexagonTexture.call(this);
  
  // 创建定时器事件，每0.5秒生成一个六边形
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: spawnHexagon,
    callbackScope: this,
    loop: true
  });
}

/**
 * 创建六边形纹理
 */
function createHexagonTexture() {
  const graphics = this.add.graphics();
  
  // 六边形参数
  const size = 30; // 六边形半径
  const hexagonPoints = [];
  
  // 计算六边形的6个顶点坐标
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度60度
    const x = size + Math.cos(angle) * size;
    const y = size + Math.sin(angle) * size;
    hexagonPoints.push(x, y);
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillPoints(hexagonPoints, true);
  
  // 添加描边使六边形更明显
  graphics.lineStyle(2, 0x00cccc, 1);
  graphics.strokePoints(hexagonPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  
  // 销毁graphics对象
  graphics.destroy();
}

/**
 * 在随机位置生成六边形
 */
function spawnHexagon() {
  // 检查是否达到最大数量
  if (hexagonCount >= MAX_HEXAGONS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成15个六边形，停止生成');
    return;
  }
  
  // 生成随机位置（留出边距避免六边形超出屏幕）
  const margin = 40;
  const randomX = Phaser.Math.Between(margin, this.scale.width - margin);
  const randomY = Phaser.Math.Between(margin, this.scale.height - margin);
  
  // 创建六边形精灵
  const hexagon = this.add.image(randomX, randomY, 'hexagon');
  
  // 添加简单的缩放动画效果
  hexagon.setScale(0);
  this.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  hexagonCount++;
  
  console.log(`生成第${hexagonCount}个六边形，位置: (${randomX}, ${randomY})`);
}

// 创建游戏实例
new Phaser.Game(config);