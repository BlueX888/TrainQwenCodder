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
  // 使用 Graphics 创建青色三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制青色三角形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.beginPath();
  graphics.moveTo(50, 10); // 顶点
  graphics.lineTo(10, 90); // 左下
  graphics.lineTo(90, 90); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  this.tweens.add({
    targets: triangle,
    x: '+=10', // 向右移动 10 像素
    duration: 50, // 每次抖动 50 毫秒
    ease: 'Linear',
    yoyo: true, // 往返运动
    repeat: 9, // 重复 9 次（加上初始 1 次，共 10 次往返 = 1 秒）
    loop: -1 // 无限循环
  });
  
  // 添加说明文字
  this.add.text(400, 500, '青色三角形抖动动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);