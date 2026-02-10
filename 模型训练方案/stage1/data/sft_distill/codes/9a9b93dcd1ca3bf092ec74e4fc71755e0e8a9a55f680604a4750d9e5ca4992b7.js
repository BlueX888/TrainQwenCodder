const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建菱形图形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制菱形（中心点在50,50）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(50, 0);           // 上顶点
  graphics.lineTo(100, 50);         // 右顶点
  graphics.lineTo(50, 100);         // 下顶点
  graphics.lineTo(0, 50);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建旋转动画
  this.tweens.add({
    targets: diamond,           // 动画目标
    rotation: Math.PI * 2,      // 旋转360度（2π弧度）
    duration: 4000,             // 持续4秒
    ease: 'Linear',             // 线性缓动，保持匀速旋转
    repeat: -1,                 // 无限循环（-1表示永远重复）
    yoyo: false                 // 不需要来回，只需单向旋转
  });
}

new Phaser.Game(config);