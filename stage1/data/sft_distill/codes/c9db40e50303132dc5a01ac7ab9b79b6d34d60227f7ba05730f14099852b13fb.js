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
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8800, 1);
  
  // 绘制三角形（等边三角形，中心在 (50, 50)）
  const triangleSize = 80;
  const centerX = 50;
  const centerY = 50;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - triangleSize / 2); // 顶点
  graphics.lineTo(centerX - triangleSize / 2, centerY + triangleSize / 2); // 左下
  graphics.lineTo(centerX + triangleSize / 2, centerY + triangleSize / 2); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('orangeTriangle', 100, 100);
  graphics.destroy();
  
  // 创建使用该纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'orangeTriangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 1.5,        // 放大到 1.5 倍
    scaleY: 1.5,
    duration: 1500,     // 放大用时 1.5 秒
    yoyo: true,         // 启用 yoyo 效果（放大后缩小回来）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Orange Triangle Scale Animation (3s loop)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);