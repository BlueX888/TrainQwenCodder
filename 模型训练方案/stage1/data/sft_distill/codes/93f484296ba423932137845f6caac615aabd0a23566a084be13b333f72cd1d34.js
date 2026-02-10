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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点在 64, 64）
  const size = 64;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 上顶点
  graphics.lineTo(size * 2, size);    // 右顶点
  graphics.lineTo(size, size * 2);    // 下顶点
  graphics.lineTo(0, size);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵并放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  // 从原始大小(1)缩放到24%(0.24)，然后恢复到原始大小
  // yoyo: true 表示动画会反向播放（从0.24回到1）
  // duration: 1500 表示单程1.5秒，往返共3秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: diamond,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 1500,
    yoyo: true,
    loop: -1,
    ease: 'Linear'
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Diamond Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% → 24% → 100% (1.5s each way)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);