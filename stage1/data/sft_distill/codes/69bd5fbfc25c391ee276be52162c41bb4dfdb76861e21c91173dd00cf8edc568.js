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
  // 不需要预加载外部资源
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
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 在屏幕中央创建使用菱形纹理的精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 0,                   // 目标透明度值（从当前的1淡出到0）
    duration: 500,              // 动画持续时间 0.5秒
    yoyo: true,                 // 启用 yoyo 效果（淡出后自动淡入）
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    ease: 'Linear'              // 线性缓动函数
  });
}

new Phaser.Game(config);