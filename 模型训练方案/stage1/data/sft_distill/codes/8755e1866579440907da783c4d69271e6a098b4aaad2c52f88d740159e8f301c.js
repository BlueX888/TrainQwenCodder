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
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制等边三角形（中心点为原点）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-26, 15);     // 左下角
  graphics.lineTo(26, 15);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 52, 45);
  graphics.destroy();
  
  // 创建定时器，每4秒执行一次
  timerEvent = this.time.addEvent({
    delay: 4000,                // 4秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个三角形
  spawnTriangle.call(this);
}

function spawnTriangle() {
  // 检查是否已达到最大数量
  if (triangleCount >= 3) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成3个三角形，停止生成');
    return;
  }
  
  // 生成随机位置（留出边距避免三角形被裁剪）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建三角形精灵
  const triangle = this.add.image(x, y, 'triangleTex');
  
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