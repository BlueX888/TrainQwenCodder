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
  // 使用 Graphics 绘制蓝色菱形
  const graphics = this.add.graphics();
  
  // 设置蓝色填充
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  // 菱形中心在 (50, 50)，宽高各 100 像素
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 上顶点
  graphics.lineTo(100, 50);    // 右顶点
  graphics.lineTo(50, 100);    // 下顶点
  graphics.lineTo(0, 50);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（右侧）
    duration: 2500,             // 持续时间 2.5 秒（2500 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 启用往返效果（到达终点后反向播放）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    repeat: 0                   // repeat 为 0，配合 yoyo 实现往返
  });
  
  // 添加提示文本
  this.add.text(400, 50, '蓝色菱形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);