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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，便于后续缩放
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);      // 左下角
  graphics.lineTo(90, 90);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  // 从原始大小 (scale: 1) 缩放到 24% (scale: 0.24)，然后返回
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24,           // 缩放到 24%
    scaleY: 0.24,           // 缩放到 24%
    duration: 2000,         // 持续 2 秒
    ease: 'Sine.easeInOut', // 使用平滑的缓动函数
    yoyo: true,             // 动画结束后反向播放（恢复原始大小）
    loop: -1                // 无限循环（-1 表示无限循环）
  });
  
  // 添加文字说明
  this.add.text(400, 500, '三角形 2 秒缩放到 24%，然后恢复，循环播放', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);