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
  
  // 绘制三角形（等边三角形，中心在 (50, 50)）
  const triangleSize = 80;
  const centerX = 50;
  const centerY = 50;
  const height = triangleSize * Math.sqrt(3) / 2;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - height * 2/3); // 顶点
  graphics.lineTo(centerX - triangleSize/2, centerY + height * 1/3); // 左下
  graphics.lineTo(centerX + triangleSize/2, centerY + height * 1/3); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用该纹理的 Sprite，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.48, // 缩放到 48%
    scaleY: 0.48,
    duration: 2000, // 单程 2 秒
    yoyo: true, // 来回播放（缩小后放大）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Triangle Scaling Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% → 48% → 100% (4 seconds loop)', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);