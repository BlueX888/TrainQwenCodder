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
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -60);      // 顶点
  graphics.lineTo(-52, 30);     // 左下角
  graphics.lineTo(52, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 104, 90);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置初始透明度为 0（完全透明）
  triangle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: triangle,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 2000,              // 持续时间 2 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 来回播放（1 -> 0 -> 1）
    repeat: -1                   // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Triangle fading in/out (2 seconds cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);