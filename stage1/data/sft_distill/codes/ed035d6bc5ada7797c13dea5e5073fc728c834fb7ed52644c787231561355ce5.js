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
  
  // 设置菱形颜色和样式
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制菱形（中心点在 64, 64）
  const size = 64;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 顶点
  graphics.lineTo(size * 2, size);    // 右顶点
  graphics.lineTo(size, size * 2);    // 底顶点
  graphics.lineTo(0, size);           // 左顶点
  graphics.closePath();
  
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 1500,      // 1.5秒
    yoyo: true,          // 动画结束后反向播放（恢复到原始大小）
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Diamond Scaling Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% -> 24% -> 100% (Loop)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);