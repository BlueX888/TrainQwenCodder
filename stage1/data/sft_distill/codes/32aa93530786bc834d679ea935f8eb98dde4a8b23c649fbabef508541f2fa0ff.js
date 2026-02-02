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
  // 创建紫色菱形纹理
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9b59b6, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  const size = 60;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 上顶点
  graphics.lineTo(size * 2, size);    // 右顶点
  graphics.lineTo(size, size * 2);    // 下顶点
  graphics.lineTo(0, size);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
}

function create() {
  // 创建紫色菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 添加闪烁动画
  // 使用 Tween 控制 alpha 透明度实现闪烁效果
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 0.2,                // 目标透明度（从1降到0.2）
    duration: 750,             // 单程持续时间 0.75秒
    ease: 'Sine.easeInOut',    // 缓动函数，使闪烁更平滑
    yoyo: true,                // 往返模式（0.75秒变暗 + 0.75秒变亮 = 1.5秒）
    repeat: -1                 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, '紫色菱形闪烁动画 (1.5秒/次)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);