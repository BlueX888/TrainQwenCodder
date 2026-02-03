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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制菱形（四个顶点）
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用菱形纹理的精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出 Tween 动画
  this.tweens.add({
    targets: diamond,        // 动画目标对象
    alpha: 0,                // 目标透明度（从当前的 1 渐变到 0）
    duration: 500,           // 持续时间 0.5 秒
    yoyo: true,              // 启用悠悠球效果（淡出后自动淡入）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动函数
  });
}

new Phaser.Game(config);