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
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 顶点
  graphics.lineTo(-25, 30);   // 左下角
  graphics.lineTo(25, 30);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,              // 目标位置（右侧）
    duration: 500,       // 持续时间 0.5 秒
    yoyo: true,          // 启用往返效果
    loop: -1,            // 无限循环（-1 表示永久循环）
    ease: 'Linear'       // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '绿色三角形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);