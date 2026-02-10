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
  // 使用 Graphics 绘制白色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制三角形（等边三角形，边长约 100 像素）
  graphics.beginPath();
  graphics.moveTo(0, -50);      // 顶点
  graphics.lineTo(-43, 25);     // 左下角
  graphics.lineTo(43, 25);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 初始设置为完全透明
  triangle.setAlpha(0);
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: triangle,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 1000,              // 淡入持续 1 秒
    yoyo: true,                  // 启用 yoyo 模式，动画会反向播放（淡出）
    repeat: -1,                  // -1 表示无限循环
    ease: 'Sine.easeInOut'       // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加说明文字
  this.add.text(400, 550, '白色三角形淡入淡出动画（2秒循环）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);