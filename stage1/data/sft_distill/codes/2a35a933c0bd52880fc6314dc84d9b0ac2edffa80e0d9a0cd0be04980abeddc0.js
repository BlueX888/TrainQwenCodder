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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制菱形（四个顶点坐标）
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建菱形图像对象，放置在屏幕中央
  const diamond = this.add.image(400, 300, 'diamond');
  
  // 创建淡入淡出补间动画
  this.tweens.add({
    targets: diamond,        // 动画目标对象
    alpha: 0,                // 目标透明度值（从当前的1淡出到0）
    duration: 500,           // 单程动画时长 0.5秒
    yoyo: true,              // 启用往返效果（淡出后再淡入）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动函数
  });
}

new Phaser.Game(config);