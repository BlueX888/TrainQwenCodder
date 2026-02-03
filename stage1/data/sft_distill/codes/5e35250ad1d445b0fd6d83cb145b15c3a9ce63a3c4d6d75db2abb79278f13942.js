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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制三角形（等边三角形）
  // 三角形中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 80);       // 左下角
  graphics.lineTo(90, 80);       // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  // 使用 yoyo 实现从 1 -> 0.24 -> 1 的效果
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 1000,        // 1秒缩小到24%
    yoyo: true,            // 动画反向播放（回到原始大小）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加提示文字
  const text = this.add.text(400, 500, '三角形循环缩放动画\n1秒缩小到24% → 1秒恢复', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);