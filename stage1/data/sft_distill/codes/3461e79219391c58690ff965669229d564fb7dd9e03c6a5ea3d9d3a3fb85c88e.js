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
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);  // 顶点
  graphics.lineTo(-26, 15);  // 左下角
  graphics.lineTo(26, 15);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 52, 45);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: triangle,
    x: 700,              // 目标位置（右侧）
    duration: 2500,      // 持续时间 2.5 秒
    yoyo: true,          // 往返效果（到达终点后反向回到起点）
    repeat: -1,          // 无限循环
    ease: 'Linear'       // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);