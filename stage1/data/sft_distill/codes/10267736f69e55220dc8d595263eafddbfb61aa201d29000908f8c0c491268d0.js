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
  // 使用 Graphics 创建白色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制白色三角形（等边三角形）
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(90, 80);      // 右下
  graphics.lineTo(10, 80);      // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置初始透明度为0（完全透明）
  triangle.setAlpha(0);
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    alpha: 1,                    // 目标透明度（淡入到完全不透明）
    duration: 1000,              // 单程时长1秒
    yoyo: true,                  // 启用yoyo模式（自动反向播放，实现淡出效果）
    repeat: -1,                  // 无限循环（-1表示永久重复）
    ease: 'Sine.easeInOut'       // 使用正弦缓动函数，让动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Triangle Fade In/Out Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);