const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFFF00, 1); // 黄色
  
  // 绘制六边形
  const hexRadius = 50;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = hexRadius * Math.cos(angle * i - Math.PI / 2) + hexRadius;
    const y = hexRadius * Math.sin(angle * i - Math.PI / 2) + hexRadius;
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: hexagon,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 500,      // 淡出持续 0.5 秒
    yoyo: true,         // 反向播放（淡出后淡入）
    repeat: -1,         // 无限循环
    ease: 'Linear'      // 线性缓动
  });
  
  // 添加提示文字
  this.add.text(400, 500, '黄色六边形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);