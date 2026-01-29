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
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-26, 15);     // 左下角
  graphics.lineTo(26, 15);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 52, 45);
  graphics.destroy();
  
  // 创建精灵对象
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（从 100 移动到 700）
    duration: 2500,            // 持续时间 2.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    repeat: 0                  // yoyo 模式下 repeat 设为 0
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Green Triangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The triangle moves left to right and loops forever', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);