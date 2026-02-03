const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个等边三角形（中心在原点）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(0, -60);      // 顶点
  graphics.lineTo(-52, 30);     // 左下角
  graphics.lineTo(52, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 104, 90);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵并居中
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 500,        // 0.5 秒
    yoyo: true,           // 动画结束后反向播放（恢复到原始大小）
    repeat: -1,           // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 50, '三角形缩放循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);