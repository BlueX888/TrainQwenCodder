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

let triangleCount = 0;
const MAX_TRIANGLES = 5;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-26, 15);     // 左下
  graphics.lineTo(26, 15);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkTriangle', 52, 45);
  graphics.destroy();
  
  // 创建定时器事件，每3秒触发一次
  timerEvent = this.time.addEvent({
    delay: 3000,                // 3秒
    callback: spawnTriangle,    // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 立即生成第一个三角形
  spawnTriangle.call(this);
}

function spawnTriangle() {
  if (triangleCount >= MAX_TRIANGLES) {
    // 达到最大数量，停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成5个三角形，停止生成');
    return;
  }
  
  // 生成随机位置（确保三角形完全在画布内）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建三角形精灵
  const triangle = this.add.image(x, y, 'pinkTriangle');
  
  // 添加简单的缩放动画效果
  triangle.setScale(0);
  this.tweens.add({
    targets: triangle,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  triangleCount++;
  console.log(`生成第 ${triangleCount} 个三角形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);