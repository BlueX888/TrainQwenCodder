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
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制菱形（四个顶点）
  const centerX = 50;
  const centerY = 50;
  const size = 50;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建菱形精灵并放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画，让菱形从透明到不透明
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 1,                   // 目标透明度值（完全不透明）
    duration: 4000,             // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 反向播放（从 1 回到 0）
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    onUpdate: function(tween, target) {
      // 可选：在动画更新时执行的回调
      // console.log('当前透明度:', target.alpha);
    }
  });
  
  // 添加提示文本
  this.add.text(400, 550, '菱形正在循环渐变（透明 ↔ 不透明，4秒周期）', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);