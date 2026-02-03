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
  // 使用 Graphics 程序化生成菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个顶点）
  graphics.fillStyle(0x00aaff, 1);
  graphics.beginPath();
  graphics.moveTo(64, 0);      // 上顶点
  graphics.lineTo(128, 64);    // 右顶点
  graphics.lineTo(64, 128);    // 下顶点
  graphics.lineTo(0, 64);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建菱形精灵并居中
  const diamond = this.add.sprite(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    'diamond'
  );
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    scaleX: 0.16,              // X轴缩放到16%
    scaleY: 0.16,              // Y轴缩放到16%
    duration: 2500,            // 单程持续时间2.5秒
    yoyo: true,                // 启用yoyo模式，自动恢复到原始值
    loop: -1,                  // 无限循环（-1表示永久循环）
    ease: 'Sine.easeInOut'     // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Diamond Scale Animation\nScale: 100% → 16% → 100%\nLoop: Infinite', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
}

// 创建游戏实例
new Phaser.Game(config);