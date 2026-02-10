const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建青色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(50, 10);  // 顶点
  graphics.lineTo(10, 80);  // 左下
  graphics.lineTo(90, 80);  // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 90);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵并居中
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  this.tweens.add({
    targets: triangle,
    x: '+=10',  // 向右移动10像素
    duration: 50,  // 快速移动（50毫秒）
    yoyo: true,  // 返回原位
    repeat: -1,  // 无限循环
    ease: 'Linear',
    // 通过 repeatDelay 控制每次抖动循环的间隔
    // 一次完整抖动：50ms(去) + 50ms(回) = 100ms
    // 要达到1秒一次循环，需要等待 900ms
    repeatDelay: 900
  });
  
  // 添加说明文字
  this.add.text(400, 500, '青色三角形每秒抖动一次', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);