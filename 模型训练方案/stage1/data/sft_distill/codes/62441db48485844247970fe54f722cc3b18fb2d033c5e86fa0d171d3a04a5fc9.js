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
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形，中心点在 (50, 50)）
  const size = 80;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.beginPath();
  graphics.moveTo(50, 50 - height * 2/3);  // 顶点
  graphics.lineTo(50 - size/2, 50 + height * 1/3);  // 左下
  graphics.lineTo(50 + size/2, 50 + height * 1/3);  // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24,  // 缩放到 24%
    scaleY: 0.24,
    duration: 3000,  // 3 秒
    ease: 'Linear',
    yoyo: true,  // 动画结束后反向播放（恢复）
    loop: -1,  // 无限循环（-1 表示永久循环）
    onLoop: function() {
      console.log('动画循环一次');
    }
  });
  
  // 添加提示文本
  this.add.text(400, 550, '三角形缩放动画：3秒缩小到24%，然后恢复，循环播放', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);