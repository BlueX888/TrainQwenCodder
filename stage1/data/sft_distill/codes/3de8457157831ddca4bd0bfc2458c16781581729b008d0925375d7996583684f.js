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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  
  // 绘制菱形（四个顶点连接）
  const size = 60;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size);  // 右顶点
  graphics.lineTo(size, size * 2);  // 下顶点
  graphics.lineTo(0, size);       // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁动画
  // 使用 alpha 透明度从 1 到 0.2 实现闪烁效果
  this.tweens.add({
    targets: diamond,
    alpha: 0.2,           // 目标透明度
    duration: 750,        // 单程持续时间 0.75 秒
    yoyo: true,           // 往返动画（0.75秒变暗 + 0.75秒变亮 = 1.5秒）
    repeat: -1,           // 无限循环
    ease: 'Sine.easeInOut' // 平滑缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, '紫色菱形闪烁动画（1.5秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);