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
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9b59b6, 1);
  
  // 绘制菱形（中心点在 50, 50）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(50, 0);           // 上顶点
  graphics.lineTo(100, 50);         // 右顶点
  graphics.lineTo(50, 100);         // 下顶点
  graphics.lineTo(0, 50);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁 Tween 动画
  this.tweens.add({
    targets: diamond,
    alpha: {
      from: 1,
      to: 0
    },
    duration: 750,        // 0.75 秒淡出
    yoyo: true,           // 反向播放（淡入）
    repeat: -1,           // 无限循环
    ease: 'Sine.easeInOut' // 平滑过渡
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Purple Diamond Blinking (1.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);