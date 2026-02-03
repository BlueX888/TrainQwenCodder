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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制菱形（中心点在 50, 50）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 顶点
  graphics.lineTo(size * 2, size);    // 右点
  graphics.lineTo(size, size * 2);    // 底点
  graphics.lineTo(0, size);           // 左点
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 500,        // 0.5秒
    yoyo: true,           // 播放完后反向播放（恢复原始大小）
    loop: -1,             // 无限循环
    ease: 'Linear'        // 线性缓动
  });
  
  // 添加提示文字
  this.add.text(400, 500, '菱形缩放动画（循环播放）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);