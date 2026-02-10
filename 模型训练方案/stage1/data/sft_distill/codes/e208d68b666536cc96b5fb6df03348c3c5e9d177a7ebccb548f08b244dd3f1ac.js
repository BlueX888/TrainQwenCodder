const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -40);      // 顶点
  graphics.lineTo(-35, 30);     // 左下
  graphics.lineTo(35, 30);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 70, 70);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  this.tweens.add({
    targets: triangle,
    x: {
      value: '+=10',
      duration: 50,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    },
    y: {
      value: '+=8',
      duration: 60,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    },
    angle: {
      value: '+=3',
      duration: 70,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    },
    // 整体循环周期为 2 秒
    duration: 2000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
  
  // 添加说明文字
  this.add.text(400, 500, '青色三角形抖动动画（2秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);