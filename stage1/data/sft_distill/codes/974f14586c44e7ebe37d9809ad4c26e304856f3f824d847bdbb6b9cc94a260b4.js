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
  
  // 绘制菱形（四个顶点）
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 顶部
  graphics.lineTo(100, 50);  // 右侧
  graphics.lineTo(50, 100);  // 底部
  graphics.lineTo(0, 50);    // 左侧
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建使用菱形纹理的 Sprite
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建淡入淡出循环动画
  this.tweens.add({
    targets: diamond,
    alpha: { from: 0, to: 1 },  // 从透明到不透明
    duration: 250,               // 淡入 0.25 秒
    yoyo: true,                  // 启用 yoyo 效果（淡出）
    repeat: -1,                  // 无限循环
    ease: 'Linear'               // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 500, '绿色菱形淡入淡出动画 (0.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);