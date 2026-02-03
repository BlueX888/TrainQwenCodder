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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（中心点为 50, 50，宽高各 100）
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 50);    // 右点
  graphics.lineTo(50, 100);    // 底点
  graphics.lineTo(0, 50);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 1,                   // 目标透明度值
    duration: 3000,             // 持续时间 3 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 反向播放（1 -> 0）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);