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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点为 64, 64，边长约 100）
  graphics.beginPath();
  graphics.moveTo(64, 14);      // 上顶点
  graphics.lineTo(114, 64);     // 右顶点
  graphics.lineTo(64, 114);     // 下顶点
  graphics.lineTo(14, 64);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,           // 动画目标
    scale: 0.16,                // 缩放到 16%（0.16）
    duration: 2500,             // 持续时间 2.5 秒
    yoyo: true,                 // 往返效果（缩小后再放大）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Linear'              // 线性缓动
  });
  
  // 添加提示文字
  this.add.text(400, 500, 'Diamond scaling: 100% ↔ 16%', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);