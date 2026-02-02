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
  // 使用 Graphics 创建绿色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制绿色三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点
  graphics.lineTo(60, 60);     // 右下角
  graphics.lineTo(0, 60);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(50, 300, 'triangle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: triangle,
    x: 750,                    // 目标 x 坐标（右侧）
    duration: 2500,            // 持续时间 2.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 往返效果（到达终点后返回起点）
    loop: -1                   // 无限循环（-1 表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '绿色三角形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);