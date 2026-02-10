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
  // 创建绿色三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 顶点
  graphics.lineTo(-25, 30);   // 左下角
  graphics.lineTo(25, 30);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 60);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标位置（右侧）
    duration: 2500,            // 持续时间 2.5 秒
    yoyo: true,                // 启用往返效果
    repeat: -1,                // 无限循环
    ease: 'Linear'             // 线性缓动
  });
  
  // 添加说明文本
  this.add.text(400, 50, '绿色三角形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);