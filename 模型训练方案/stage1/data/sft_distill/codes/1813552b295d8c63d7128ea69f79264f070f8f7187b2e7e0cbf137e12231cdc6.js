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
  // 创建 Graphics 对象绘制橙色菱形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制菱形（中心点在 64, 64，宽高各 128）
  graphics.beginPath();
  graphics.moveTo(64, 0);      // 顶点
  graphics.lineTo(128, 64);    // 右点
  graphics.lineTo(64, 128);    // 底点
  graphics.lineTo(0, 64);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  
  // 销毁 Graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用菱形纹理的 Sprite
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁动画 Tween
  this.tweens.add({
    targets: diamond,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 1500,        // 单程 1.5 秒
    yoyo: true,            // 启用往返效果（0→1→0）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加说明文字
  this.add.text(400, 550, '橙色菱形闪烁动画（3秒一个循环）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);