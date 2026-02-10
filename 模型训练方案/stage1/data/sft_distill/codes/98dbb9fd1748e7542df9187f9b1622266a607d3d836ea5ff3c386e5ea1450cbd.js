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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点为原点）
  const size = 100;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建菱形精灵并设置位置
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，4秒循环播放
  this.tweens.add({
    targets: diamond,
    alpha: 1,                    // 目标透明度为1（完全不透明）
    duration: 4000,              // 持续时间4秒
    ease: 'Linear',              // 线性缓动
    yoyo: false,                 // 不反向播放
    repeat: -1,                  // 无限循环（-1表示永远重复）
    repeatDelay: 0               // 重复之间无延迟
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Diamond Fade-In Animation (4s loop)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);