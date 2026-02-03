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
const MAX_HEXAGONS = 20;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  hexagonCount = 0;
  
  // 使用 Graphics 创建六边形纹理
  createHexagonTexture.call(this);
  
  // 创建定时器事件，每2秒生成一个六边形
  timerEvent = this.time.addEvent({
    delay: 2000,                    // 2秒
    callback: spawnHexagon,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true                      // 循环执行
  });
  
  // 显示提示文本
  this.add.text(10, 10, '每2秒生成一个蓝色六边形（最多20个）', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 显示计数文本
  this.countText = this.add.text(10, 35, `已生成: 0 / ${MAX_HEXAGONS}`, {
    fontSize: '16px',
    color: '#00ff00'
  });
}

function createHexagonTexture() {
  const graphics = this.add.graphics();
  
  // 六边形参数
  const size = 30;
  const hexagonPoints = [];
  
  // 计算六边形的6个顶点坐标
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = size + size * Math.cos(angle);
    const y = size + size * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x0088ff, 1);
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0], hexagonPoints[1]);
  for (let i = 2; i < hexagonPoints.length; i += 2) {
    graphics.lineTo(hexagonPoints[i], hexagonPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 添加白色边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  graphics.destroy();
}

function spawnHexagon() {
  // 检查是否达到最大数量
  if (hexagonCount >= MAX_HEXAGONS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    
    // 显示完成提示
    this.add.text(400, 300, '已生成20个六边形！', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（留出边距）
  const margin = 40;
  const x = Phaser.Math.Between(margin, 800 - margin);
  const y = Phaser.Math.Between(margin + 60, 600 - margin);
  
  // 创建六边形图像
  const hexagon = this.add.image(x, y, 'hexagon');
  
  // 添加缩放动画效果
  hexagon.setScale(0);
  this.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  hexagonCount++;
  
  // 更新计数文本
  this.countText.setText(`已生成: ${hexagonCount} / ${MAX_HEXAGONS}`);
}

new Phaser.Game(config);