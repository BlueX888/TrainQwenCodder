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

let triangleCount = 0;
const MAX_TRIANGLES = 15;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -20);      // 顶点
  graphics.lineTo(-17.32, 10);  // 左下角
  graphics.lineTo(17.32, 10);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('blueTriangle', 40, 40);
  graphics.destroy();
  
  // 创建定时器事件，每4秒执行一次
  timerEvent = this.time.addEvent({
    delay: 4000,                // 4秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true
  });
  
  // 显示提示文本
  this.add.text(10, 10, 'Triangles: 0 / 15', {
    fontSize: '20px',
    color: '#ffffff'
  }).setName('counterText');
}

function spawnTriangle() {
  if (triangleCount >= MAX_TRIANGLES) {
    // 达到最大数量，移除定时器
    timerEvent.remove();
    console.log('已生成15个三角形，停止生成');
    return;
  }
  
  // 生成随机位置（留出边界空间）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建三角形精灵
  const triangle = this.add.image(x, y, 'blueTriangle');
  
  // 添加一个简单的出现动画
  triangle.setScale(0);
  this.tweens.add({
    targets: triangle,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 更新计数
  triangleCount++;
  
  // 更新文本显示
  const counterText = this.children.getByName('counterText');
  if (counterText) {
    counterText.setText(`Triangles: ${triangleCount} / ${MAX_TRIANGLES}`);
  }
  
  console.log(`生成第 ${triangleCount} 个三角形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);